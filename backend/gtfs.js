import express from "express";
import {supabase} from "./supabaseClient.js";

const router = express.Router();

router.get("/stops", async (req, res) => {
    const{data, error} = (await supabase.from("stops").select("*").eq("location_type","1").limit(100));
    if (error) return res.status(500).json({error: error.message});
    res.json(data);
});

export default router;