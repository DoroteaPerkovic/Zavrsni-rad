import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { supabase } from "./supabaseClient.js";
import cron from "node-cron";
import { generateTokens, verifyAccessToken, verifyRefreshToken } from "./tokens.js";
import gtfsRoutes from "./gtfs.js";
import {spawn} from "child_process";

const app = express();
const port = 5000;

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json());


app.use("/gtfs", gtfsRoutes);

app.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  const { data: existingUser, error: fetchError } = await supabase
    .from("korisnik")
    .select("*")
    .or(`email.eq.${email},username.eq.${username}`);

  if (fetchError) return res.json({ success: false, message: fetchError.message });
  if (existingUser.length > 0) return res.json({ success: false, message: "Korisnik već postoji" });

  const hashedPassword = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from("korisnik")
    .insert([{username, email, password_hash: hashedPassword, role: "prijavljen"}]);

  if (error) return res.json({ success: false, message: error.message });

  res.json({ success: true });
});

//login
app.post("/", async (req, res) => {
  const { name, password } = req.body;

  const { data: users, error } = await supabase
    .from("korisnik")
    .select("*")
    .or(`email.eq.${name},username.eq.${name}`);

  if (error || users.length === 0) return res.json({ success: false, message: "Korisnik ne postoji" });

  const user = users[0];
  const valid = await bcrypt.compare(password, user.password_hash);

  if (!valid) return res.json({ success: false, message: "Pogrešna lozinka" });
  
  const tokens = generateTokens({id: user.user_id, role:user.role});
  res.json({ success: true, userId: user.id, username: user.username, role:user.role, accessToken:tokens.accessToken, refreshToken:tokens.refreshToken });
});

app.post("/guest", async (req, res) => {
  try {
    const guestUsername = `guest_${Date.now()}`;
    const guestEmail = `${guestUsername}@guest.local`;
    const role = "guest";

    const { data, error } = await supabase
      .from("korisnik")
      .insert([{ username: guestUsername, email: guestEmail, password_hash: "", role }])
      .select()
      .single(); 

    if (error) return res.json({ success: false, message: error.message });

    res.json({
      success: true,
      userId: data.user_id,
      username: data.username,
      role: data.role
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post("/refresh", (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(401).json({ message: "Nema tokena" });

  try {
    const payload = verifyRefreshToken(token);
    const newAccessToken = jwt.sign(
      { userId: payload.userId, role: payload.role },
      "tvojSuperSecretAccessToken",
      { expiresIn: "15m" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    res.status(403).json({ message: "Refresh token nije valjan" });
  }
});

app.get("/api/ruta", (req, res) => {
  const { start, end } = req.query; // npr. /api/ruta?start=264_2&end=115_4

  const python = spawn('python', ['./algrs/main.py', start, end]);

  let dataString = '';

  python.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  python.on('close', (code) => {
    try {
      const result = JSON.parse(dataString);
      res.json(result);
    } catch (e) {
      res.status(500).json({ error: "Greška u obradi algoritma", raw: dataString });
    }
  });
});

cron.schedule("* * * * *", async () => {
  try {
    const twelveHoursAgo = new Date(Date.now() - 12*60*60*1000).toISOString();

    const { data, error } = await supabase
      .from("korisnik")
      .delete()
      .lt("created_at", twelveHoursAgo)
      .eq("role", "guest")
      .select();

    if (error) {
      console.error("Greška pri brisanju guest korisnika:", error.message);
    } else if (data.length > 0) {
      console.log(`Obrisano ${data.length} guest korisnika.`);
    }
  } catch (err) {
    console.error("Greška u cron tasku:", err.message);
  }
});

app.listen(port, () => {
  console.log(`Server radi na portu ${port}`);
});