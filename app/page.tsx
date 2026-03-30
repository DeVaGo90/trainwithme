"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Home() {
  const [user, setUser] = useState<any>(null);
  const [sessions, setSessions] = useState<any[]>([]);
  const [friendships, setFriendships] = useState<any[]>([]);
  const [nearbySessions, setNearbySessions] = useState<any[]>([]);

  // -------------------- LOAD DATA --------------------

  const loadUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data.user);
  };

  const loadSessions = async () => {
    const { data } = await supabase.from("sessions").select("*");
    setSessions(data || []);
  };

  const loadFriendships = async () => {
    const { data } = await supabase.from("friendships").select("*");
    setFriendships(data || []);
  };

  const loadNearby = async () => {
    // aktuell einfach alle Sessions als "nearby"
    const { data } = await supabase.from("sessions").select("*");
    setNearbySessions(data || []);
  };

  useEffect(() => {
    loadUser();
    loadSessions();
    loadFriendships();
    loadNearby();
  }, []);

  // -------------------- COUNTERS --------------------

  const stats = useMemo(() => {
    return {
      sessions: sessions.length,
      friends: friendships.filter((f) => f.status === "accepted").length,
      nearby: nearbySessions.length,
    };
  }, [sessions, friendships, nearbySessions]);

  // -------------------- UI --------------------

  return (
    <div style={{ padding: 20 }}>
      <h1>TrainWithMe</h1>
      <p>Eingeloggt als {user?.email}</p>

      <div style={{ display: "flex", gap: 20, marginTop: 20 }}>
        <div style={cardStyle}>
          <div>Sessions</div>
          <b>{stats.sessions}</b>
        </div>

        <div style={cardStyle}>
          <div>Freunde</div>
          <b>{stats.friends}</b>
        </div>

        <div style={cardStyle}>
          <div>Nearby</div>
          <b>{stats.nearby}</b>
        </div>
      </div>

      <h2 style={{ marginTop: 30 }}>Sessions</h2>
      {sessions.map((s) => (
        <div key={s.id} style={boxStyle}>
          {s.user_name} – {s.sport}
        </div>
      ))}

      <h2 style={{ marginTop: 30 }}>Freunde</h2>
      {friendships
        .filter((f) => f.status === "accepted")
        .map((f) => (
          <div key={f.id} style={boxStyle}>
            {f.requester_id} → {f.addressee_id}
          </div>
        ))}

      <h2 style={{ marginTop: 30 }}>Nearby Sessions</h2>
      {nearbySessions.map((s) => (
        <div key={s.id} style={boxStyle}>
          {s.sport} – {s.location_label}
        </div>
      ))}
    </div>
  );
}

const cardStyle = {
  padding: 16,
  borderRadius: 12,
  background: "#eee",
  minWidth: 100,
};

const boxStyle = {
  padding: 12,
  border: "1px solid #ccc",
  borderRadius: 8,
  marginTop: 10,
};
