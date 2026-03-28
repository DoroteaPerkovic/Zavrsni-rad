import express from "express";
import {supabase} from "./supabaseClient.js";

const gtfsRoutes = express.Router();

gtfsRoutes.get("/stops/tram", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tram_stops")
      .select("*");

    if (error) throw error;

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

gtfsRoutes.get("/stops/bus", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("bus_stops")
      .select("*")
      .range(0,3000);

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default gtfsRoutes;