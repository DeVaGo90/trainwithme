"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  User,
  Users,
  MessageCircle,
  MapPin,
  Plus,
  Search,
  LogOut,
  Check,
  X,
  Dumbbell,
  Bike,
  Waves,
  PersonStanding,
  Trophy,
  HeartHandshake,
  ShieldCheck,
  Send,
  ChevronLeft,
  Filter,
  Globe,
  Lock,
  Navigation,
  Map as MapIcon,
  LocateFixed,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const sports = [
  "Alle",
  "Laufen",
  "Gym",
  "Radfahren",
  "Fußball",
  "Tennis",
  "Yoga",
  "Wandern",
  "Schwimmen",
  "Trailrunning",
  "Hyrox",
];

type TabKey = "sessions" | "friends" | "profile";
type Visibility = "public" | "friends";
type FriendshipStatus = "pending" | "accepted" | "rejected";

type AppUser = {
  id: string;
  email: string;
};

type SessionItem = {
  id: string;
  user_id: string | null;
  user_name: string | null;
  sport: string | null;
  location: string | null;
  visibility?: Visibility | null;
  joined_count?: number | null;
  created_at?: string | null;
};

type Profile = {
  user_id: string;
  email: string;
  display_name: string | null;
};

type Friendship = {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: FriendshipStatus;
};

type SessionParticipant = {
  id: string;
  session_id: string;
  user_id: string;
  participant_name: string | null;
  participant_email: string | null;
};

type SessionMessage = {
  id: string;
  session_id: string;
  user_id: string;
  user_name: string | null;
  message: string;
  created_at: string | null;
};

type Coordinates = {
  lat: number;
  lng: number;
};

function sportIcon(label: string) {
  const props = { size: 16, strokeWidth: 2.2 };
  switch (label) {
    case "Laufen":
    case "Wandern":
    case "Trailrunning":
      return <PersonStanding {...props} />;
    case "Gym":
    case "Hyrox":
      return <Dumbbell {...props} />;
    case "Radfahren":
      return <Bike {...props} />;
    case "Schwimmen":
      return <Waves {...props} />;
    case "Fußball":
    case "Tennis":
      return <Trophy {...props} />;
    default:
      return <Plus {...props} />;
  }
}

function parseCoordinates(value: string | null | undefined): Coordinates | null {
  if (!value) return null;
  const match = value.match(/^\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*$/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}

function formatCoords(coords: Coordinates | null) {
  if (!coords) return "Kein Standort";
  return `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
}

function distanceKm(a: Coordinates, b: Coordinates) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s1 = Math.sin(dLat / 2) ** 2;
  const s2 = Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(s1 + s2), Math.sqrt(1 - s1 - s2));
  return R * c;
}

function MobileShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-100 text-slate-900 pb-24">
      <div className="mx-auto max-w-md px-3 pt-3">{children}</div>
    </main>
  );
}

function AppCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>{children}</section>;
}

function PrimaryButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white ${props.className || ""}`} />;
}

function GreenButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white ${props.className || ""}`} />;
}

function RedButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-rose-600 px-4 py-3 text-sm font-semibold text-white ${props.className || ""}`} />;
}

function GhostButton(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 ${props.className || ""}`} />;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none placeholder:text-slate-400 ${props.className || ""}`} />;
}

function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none ${props.className || ""}`} />;
}

function StatPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-3">
      <div className="mb-2 flex items-center gap-2 text-slate-500">{icon}<span className="text-xs font-medium">{label}</span></div>
      <div className="text-lg font-semibold tracking-tight">{value}</div>
    </div>
  );
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabKey>("sessions");
  const [user, setUser] = useState<AppUser | null>(null);
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [friendships, setFriendships] = useState<Friendship[]>([]);
  const [participants, setParticipants] = useState<SessionParticipant[]>([]);
  const [messages, setMessages] = useState<SessionMessage[]>([]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [sport, setSport] = useState("Laufen");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [userSearch, setUserSearch] = useState("");
  const [sessionSearch, setSessionSearch] = useState("");
  const [sessionSportFilter, setSessionSportFilter] = useState("Alle");
  const [sessionAudienceFilter, setSessionAudienceFilter] = useState<"all" | Visibility>("all");
  const [message, setMessage] = useState("");
  const [activeChatSessionId, setActiveChatSessionId] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [currentCoords, setCurrentCoords] = useState<Coordinates | null>(null);
  const [currentLocationLabel, setCurrentLocationLabel] = useState("");
  const [locationNames, setLocationNames] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data.session?.user;
      if (currentUser) setUser({ id: currentUser.id, email: currentUser.email || "" });
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user;
      if (currentUser) {
        setUser({ id: currentUser.id, email: currentUser.email || "" });
      } else {
        setUser(null);
        setProfile(null);
        setAllProfiles([]);
        setFriendships([]);
        setParticipants([]);
        setMessages([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    void refreshAllData();
  }, []);

  useEffect(() => {
    if (!user) return;
    void initializeUserData();
  }, [user]);

  useEffect(() => {
    if (!activeChatSessionId) {
      setMessages([]);
      return;
    }
    void loadMessages(activeChatSessionId);
  }, [activeChatSessionId]);

  const incomingRequests = useMemo(() => {
    if (!user) return [] as Friendship[];
    return friendships.filter((f) => f.addressee_id === user.id && f.status === "pending");
  }, [friendships, user]);

  const friendIds = useMemo(() => {
    if (!user) return [] as string[];
    return friendships
      .filter((f) => f.status === "accepted")
      .map((f) => (f.requester_id === user.id ? f.addressee_id : f.requester_id));
  }, [friendships, user]);

  const friendProfiles = useMemo(
    () => allProfiles.filter((p) => friendIds.includes(p.user_id)),
    [allProfiles, friendIds]
  );

  const discoverableProfiles = useMemo(() => {
    if (!user) return [] as Profile[];
    return allProfiles.filter((p) => {
      if (p.user_id === user.id) return false;
      const alreadyRelated = friendships.some(
        (f) =>
          (f.requester_id === user.id && f.addressee_id === p.user_id) ||
          (f.addressee_id === user.id && f.requester_id === p.user_id)
      );
      if (alreadyRelated) return false;
      const text = `${p.display_name || ""} ${p.email}`.toLowerCase();
      return text.includes(userSearch.toLowerCase());
    });
  }, [allProfiles, friendships, user, userSearch]);

  const visibleSessions = useMemo(() => {
    if (!user) return [] as SessionItem[];
    return sessions.filter((s) => {
      const vis = s.visibility || "public";
      const audienceMatch = sessionAudienceFilter === "all" ? true : vis === sessionAudienceFilter;
      const sportMatch = sessionSportFilter === "Alle" ? true : s.sport === sessionSportFilter;
      const text = `${s.user_name || ""} ${s.sport || ""} ${s.location || ""}`.toLowerCase();
      const searchMatch = text.includes(sessionSearch.toLowerCase());
      const friendshipAccess = vis === "public" || friendIds.includes(s.user_id || "") || s.user_id === user.id;
      return audienceMatch && sportMatch && searchMatch && friendshipAccess;
    });
  }, [sessions, user, sessionAudienceFilter, sessionSportFilter, sessionSearch, friendIds]);

  const nearbySessions = useMemo(() => {
    if (!currentCoords) return [] as Array<SessionItem & { distance: number }>;
    return visibleSessions
      .map((s) => {
        const coords = parseCoordinates(s.location);
        if (!coords) return null;
        return { ...s, distance: distanceKm(currentCoords, coords) };
      })
      .filter(Boolean)
      .sort((a, b) => a!.distance - b!.distance)
      .slice(0, 5) as Array<SessionItem & { distance: number }>;
  }, [visibleSessions, currentCoords]);

  const activeChatMessages = useMemo(
    () => messages.sort((a, b) => (a.created_at || "").localeCompare(b.created_at || "")),
    [messages]
  );

  const stats = useMemo(
    () => ({
      sessionCount: sessions?.length || 0,
      friendCount: friendships?.filter((f) => f.status === "accepted")?.length || 0,
      requestCount: nearbySessions?.length || 0,
    }),
    [sessions, friendships, nearbySessions]
  );

  useEffect(() => {
    const coordinateLocations = Array.from(
      new Set(sessions.map((s) => s.location).filter((value): value is string => !!parseCoordinates(value)))
    );

    coordinateLocations.forEach((value) => {
      if (!locationNames[value]) {
        void reverseGeocodeString(value);
      }
    });
  }, [sessions, locationNames]);

  function getSessionParticipants(sessionId: string) {
    return participants.filter((p) => p.session_id === sessionId);
  }

  function hasJoined(sessionId: string) {
    if (!user) return false;
    return participants.some((p) => p.session_id === sessionId && p.user_id === user.id);
  }

  async function reverseGeocode(coords: Coordinates) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.lat}&lon=${coords.lng}`,
        {
          headers: {
            Accept: "application/json",
          },
        }
      );

      if (!response.ok) return "";

      const data = await response.json();
      const address = data.address || {};
      const city =
        address.city ||
        address.town ||
        address.village ||
        address.hamlet ||
        address.municipality ||
        "";
      const state = address.state || "";

      return [city, state].filter(Boolean).join(", ") || data.display_name || "";
    } catch {
      return "";
    }
  }

  async function reverseGeocodeString(rawLocation: string) {
    const coords = parseCoordinates(rawLocation);
    if (!coords) return "";
    const label = await reverseGeocode(coords);
    if (label) {
      setLocationNames((prev) => ({ ...prev, [rawLocation]: label }));
    }
    return label;
  }

  function displayLocation(rawLocation: string | null | undefined) {
    if (!rawLocation) return "-";
    return locationNames[rawLocation] || rawLocation;
  }

  async function refreshAllData() {
    await Promise.all([loadSessions(), loadParticipants()]);
  }

  async function initializeUserData() {
    await ensureProfile();
    await Promise.all([
      loadProfile(),
      loadAllProfiles(),
      loadFriendships(),
      loadSessions(),
      loadParticipants(),
    ]);
  }

  async function loadSessions() {
    const { data } = await supabase
      .from("sessions")
      .select("id, user_id, user_name, sport, location, visibility, joined_count, created_at")
      .order("created_at", { ascending: false });
    setSessions(data || []);
    return data || [];
  }

  async function loadParticipants() {
    const { data } = await supabase
      .from("session_participants")
      .select("id, session_id, user_id, participant_name, participant_email");
    setParticipants(data || []);
    return data || [];
  }

  async function loadMessages(sessionId: string) {
    const { data } = await supabase
      .from("session_messages")
      .select("id, session_id, user_id, user_name, message, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });
    setMessages(data || []);
  }

  async function ensureProfile() {
    if (!user) return;
    const { data } = await supabase.from("profiles").select("user_id").eq("user_id", user.id).maybeSingle();
    if (!data) {
      await supabase.from("profiles").insert({
        user_id: user.id,
        email: user.email,
        display_name: user.email.split("@")[0],
      });
    }
  }

  async function loadProfile() {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("user_id, email, display_name")
      .eq("user_id", user.id)
      .single();
    if (data) {
      setProfile(data);
      setDisplayName(data.display_name || "");
      return data;
    }
  }

  async function loadAllProfiles() {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, email, display_name")
      .order("display_name", { ascending: true });
    setAllProfiles(data || []);
    return data || [];
  }

  async function loadFriendships() {
    if (!user) return;
    const { data } = await supabase
      .from("friendships")
      .select("id, requester_id, addressee_id, status")
      .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`);
    setFriendships((data || []) as Friendship[]);
    return (data || []) as Friendship[];
  }

  async function signUp() {
    setMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return setMessage("Registrierung fehlgeschlagen: " + error.message);
    setMessage("Registrierung gestartet. Bestätige ggf. deine E-Mail.");
  }

  async function signIn() {
    setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return setMessage("Login fehlgeschlagen: " + error.message);
    setMessage("Login erfolgreich.");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setMessage("Abgemeldet.");
  }

  async function saveProfile() {
    if (!user) return;
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName })
      .eq("user_id", user.id);
    if (error) return setMessage("Profil konnte nicht gespeichert werden: " + error.message);
    setMessage("Profil gespeichert.");
    await Promise.all([loadProfile(), loadAllProfiles()]);
  }

  function useCurrentLocation() {
    if (!navigator.geolocation) return setMessage("Geolocation wird von diesem Browser nicht unterstützt.");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const raw = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
        setCurrentCoords(coords);
        setLocation(raw);
        const label = await reverseGeocode(coords);
        if (label) {
          setCurrentLocationLabel(label);
          setLocationNames((prev) => ({ ...prev, [raw]: label }));
          setMessage(`Aktueller Standort übernommen: ${label}`);
        } else {
          setCurrentLocationLabel(raw);
          setMessage("Aktueller Standort übernommen.");
        }
      },
      () => setMessage("Standortfreigabe wurde nicht erlaubt.")
    );
  }

  async function detectNearby() {
    if (!navigator.geolocation) return setMessage("Geolocation wird von diesem Browser nicht unterstützt.");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        const raw = `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`;
        setCurrentCoords(coords);
        const label = await reverseGeocode(coords);
        if (label) {
          setCurrentLocationLabel(label);
          setLocationNames((prev) => ({ ...prev, [raw]: label }));
        }
        setMessage("Nearby Sessions aktualisiert.");
      },
      () => setMessage("Standortfreigabe wurde nicht erlaubt.")
    );
  }

  async function sendFriendRequest(targetUserId: string) {
    if (!user) return;
    const { error } = await supabase
      .from("friendships")
      .insert({ requester_id: user.id, addressee_id: targetUserId, status: "pending" });
    if (error) return setMessage("Anfrage konnte nicht gesendet werden: " + error.message);
    setMessage("Freundschaftsanfrage gesendet.");
    await loadFriendships();
  }

  async function acceptFriend(id: string) {
    if (!user) return;
    const { error } = await supabase
      .from("friendships")
      .update({ status: "accepted" })
      .eq("id", id)
      .eq("addressee_id", user.id);
    if (error) return setMessage("Anfrage konnte nicht angenommen werden: " + error.message);
    setMessage("Freund hinzugefügt.");
    await Promise.all([loadFriendships(), loadAllProfiles()]);
  }

  async function rejectFriend(id: string) {
    if (!user) return;
    const { error } = await supabase
      .from("friendships")
      .update({ status: "rejected" })
      .eq("id", id)
      .eq("addressee_id", user.id);
    if (error) return setMessage("Anfrage konnte nicht abgelehnt werden: " + error.message);
    setMessage("Anfrage abgelehnt.");
    await loadFriendships();
  }

  async function createSession() {
    if (!user) return setMessage("Bitte zuerst einloggen.");
    if (!profile?.display_name || !sport || !location) {
      return setMessage("Bitte Profilname, Sport und Ort setzen.");
    }
    const { data, error } = await supabase
      .from("sessions")
      .insert({
        user_id: user.id,
        user_name: profile.display_name,
        sport,
        location,
        visibility,
        joined_count: 1,
        status: "live",
      })
      .select("id")
      .single();
    if (error) return setMessage("Session konnte nicht erstellt werden: " + error.message);
    const participantInsert = await supabase.from("session_participants").insert({
      session_id: data.id,
      user_id: user.id,
      participant_name: profile.display_name,
      participant_email: user.email,
    });
    if (participantInsert.error) {
      setMessage("Session erstellt, Teilnehmer aber nicht gespeichert: " + participantInsert.error.message);
    } else {
      setMessage("Session erstellt.");
    }
    setLocation("");
    await refreshAllData();
  }

  async function joinSession(session: SessionItem) {
    if (!user) return;
    if (hasJoined(session.id)) return setMessage("Du bist bereits dabei.");
    const participantName = profile?.display_name || user.email;
    const { error } = await supabase.from("session_participants").insert({
      session_id: session.id,
      user_id: user.id,
      participant_name: participantName,
      participant_email: user.email,
    });
    if (error) return setMessage("Beitritt fehlgeschlagen: " + error.message);
    const nextCount = (session.joined_count || 0) + 1;
    await supabase.from("sessions").update({ joined_count: nextCount }).eq("id", session.id);
    setMessage("Du bist der Session beigetreten.");
    await refreshAllData();
  }

  async function deleteSession(id: string, ownerId: string | null) {
    if (!user || user.id !== ownerId) return;
    await supabase.from("session_messages").delete().eq("session_id", id);
    await supabase.from("session_participants").delete().eq("session_id", id);
    const { error } = await supabase.from("sessions").delete().eq("id", id);
    if (error) return setMessage("Session konnte nicht gelöscht werden: " + error.message);
    if (activeChatSessionId === id) {
      setActiveChatSessionId(null);
      setMessages([]);
    }
    setMessage("Session gelöscht.");
    await refreshAllData();
  }

  async function sendChatMessage() {
    if (!user || !activeChatSessionId || !chatMessage.trim()) return;
    const senderName = profile?.display_name || user.email;
    const { error } = await supabase.from("session_messages").insert({
      session_id: activeChatSessionId,
      user_id: user.id,
      user_name: senderName,
      message: chatMessage.trim(),
    });
    if (error) return setMessage("Nachricht konnte nicht gesendet werden: " + error.message);
    setChatMessage("");
    await loadMessages(activeChatSessionId);
  }

  if (!user) {
    return (
      <MobileShell>
        <AppCard className="p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 p-3 text-white"><ShieldCheck size={20} /></div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">TrainWithMe</h1>
              <p className="text-sm text-slate-500">Mobile UI mit Login, Freunden, Map und Nearby Sessions</p>
            </div>
          </div>
          <div className="grid gap-3">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-Mail" />
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Passwort" />
            <PrimaryButton onClick={signIn}>Einloggen</PrimaryButton>
            <GreenButton onClick={signUp}>Registrieren</GreenButton>
          </div>
          {message && <div className="mt-4 rounded-2xl bg-indigo-50 px-4 py-3 text-sm text-slate-700">{message}</div>}
        </AppCard>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <AppCard className="mb-4 overflow-hidden border-none bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-700 text-white">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/70">TrainWithMe</div>
            <h1 className="text-2xl font-bold tracking-tight">Nearby Sessions</h1>
            <p className="mt-2 text-sm text-white/80">Eingeloggt als {user.email}</p>
          </div>
          <button onClick={signOut} className="rounded-2xl bg-white/15 px-3 py-2 text-sm font-semibold text-white backdrop-blur">
            <LogOut size={16} />
          </button>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <StatPill icon={<MessageCircle size={14} />} label="Sessions" value={stats.sessionCount} />
          <StatPill icon={<HeartHandshake size={14} />} label="Freunde" value={stats.friendCount} />
          <StatPill icon={<MapIcon size={14} />} label="Nearby" value={nearbySessions.length} />
        </div>
      </AppCard>

      {message && <AppCard className="mb-4 bg-indigo-50 text-sm text-slate-700">{message}</AppCard>}

      {activeTab === "profile" && (
        <AppCard>
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3"><User size={18} /></div>
            <div>
              <h2 className="text-lg font-semibold">Profil</h2>
              <p className="text-sm text-slate-500">Deinen Anzeigenamen anpassen</p>
            </div>
          </div>
          <div className="grid gap-3">
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Anzeigename" />
            <PrimaryButton onClick={saveProfile}>Profil speichern</PrimaryButton>
          </div>
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
            <div><span className="font-semibold text-slate-900">Name:</span> {profile?.display_name || "-"}</div>
            <div className="mt-1"><span className="font-semibold text-slate-900">E-Mail:</span> {user.email}</div>
            <div className="mt-1"><span className="font-semibold text-slate-900">Aktueller Standort:</span> {currentLocationLabel || formatCoords(currentCoords)}</div>
          </div>
        </AppCard>
      )}

      {activeTab === "friends" && (
        <div className="grid gap-4">
          <AppCard>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3"><Search size={18} /></div>
              <div>
                <h2 className="text-lg font-semibold">Personen finden</h2>
                <p className="text-sm text-slate-500">Neue Freunde direkt in der App</p>
              </div>
            </div>
            <Input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="Suche nach Name oder E-Mail" className="mb-3" />
            <div className="grid gap-3">
              {discoverableProfiles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Keine passenden Nutzer gefunden.</div>
              ) : (
                discoverableProfiles.map((p) => (
                  <div key={p.user_id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="font-semibold">{p.display_name || p.email}</div>
                    <div className="mt-1 text-sm text-slate-500">{p.email}</div>
                    <PrimaryButton onClick={() => sendFriendRequest(p.user_id)} className="mt-3 w-full">Hinzufügen</PrimaryButton>
                  </div>
                ))
              )}
            </div>
          </AppCard>

          <AppCard>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3"><Users size={18} /></div>
              <div>
                <h2 className="text-lg font-semibold">Freunde</h2>
                <p className="text-sm text-slate-500">Deine bestätigten Kontakte</p>
              </div>
            </div>
            <div className="grid gap-3">
              {friendProfiles.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Noch keine Freunde.</div>
              ) : (
                friendProfiles.map((friend) => (
                  <div key={friend.user_id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="font-semibold">{friend.display_name || friend.email}</div>
                    <div className="mt-1 text-sm text-slate-500">{friend.email}</div>
                  </div>
                ))
              )}
            </div>
          </AppCard>

          <AppCard>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3"><HeartHandshake size={18} /></div>
              <div>
                <h2 className="text-lg font-semibold">Anfragen</h2>
                <p className="text-sm text-slate-500">Offene Freundschaftsanfragen</p>
              </div>
            </div>
            <div className="grid gap-3">
              {incomingRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Keine offenen Anfragen.</div>
              ) : (
                incomingRequests.map((request) => {
                  const sender = allProfiles.find((p) => p.user_id === request.requester_id);
                  return (
                    <div key={request.id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="font-semibold">{sender?.display_name || sender?.email || "Unbekannt"}</div>
                      <div className="mt-1 text-sm text-slate-500">möchte dich hinzufügen</div>
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <GreenButton onClick={() => acceptFriend(request.id)}><Check size={16} /> Annehmen</GreenButton>
                        <GhostButton onClick={() => rejectFriend(request.id)}><X size={16} /> Ablehnen</GhostButton>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </AppCard>
        </div>
      )}

      {activeTab === "sessions" && !activeChatSessionId && (
        <div className="grid gap-4">
          <AppCard>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3"><MapIcon size={18} /></div>
              <div>
                <h2 className="text-lg font-semibold">Map & Nearby</h2>
                <p className="text-sm text-slate-500">Sessions in deiner Nähe finden</p>
              </div>
            </div>

            <div className="mb-3 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              {currentCoords ? (
                <iframe
                  title="Nearby Map"
                  className="h-56 w-full"
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${currentCoords.lng - 0.02}%2C${currentCoords.lat - 0.02}%2C${currentCoords.lng + 0.02}%2C${currentCoords.lat + 0.02}&layer=mapnik&marker=${currentCoords.lat}%2C${currentCoords.lng}`}
                />
              ) : (
                <div className="flex h-56 items-center justify-center px-6 text-center text-sm text-slate-500">
                  Aktiviere deinen Standort, um die Karte und Nearby Sessions zu sehen.
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <GhostButton onClick={detectNearby}><LocateFixed size={16} /> Standort für Nearby erkennen</GhostButton>
              <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">Dein Standort:</span> {currentLocationLabel || formatCoords(currentCoords)}
              </div>
            </div>

            <div className="mt-4 grid gap-3">
              <div className="text-sm font-semibold text-slate-900">Sessions in deiner Nähe</div>
              {nearbySessions.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Noch keine Nearby Sessions mit Koordinaten gefunden.</div>
              ) : (
                nearbySessions.map((s) => (
                  <div key={s.id} className="rounded-2xl border border-slate-200 p-4">
                    <div className="font-semibold">{s.user_name || "Unbekannt"}</div>
                    <div className="mt-1 text-sm text-slate-500">{s.sport || "-"} · {displayLocation(s.location)}</div>
                    <div className="mt-2 text-sm font-semibold text-emerald-700">{s.distance.toFixed(1)} km entfernt</div>
                    {parseCoordinates(s.location) && (
                      <GhostButton
                        className="mt-3 w-full"
                        onClick={() => {
                          const coords = parseCoordinates(s.location)!;
                          window.open(
                            `https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`,
                            "_blank"
                          );
                        }}
                      >
                        <Navigation size={16} /> Route öffnen
                      </GhostButton>
                    )}
                  </div>
                ))
              )}
            </div>
          </AppCard>

          <AppCard>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3"><Plus size={18} /></div>
              <div>
                <h2 className="text-lg font-semibold">Neue Session</h2>
                <p className="text-sm text-slate-500">Schnell eine Sport-Session erstellen</p>
              </div>
            </div>
            <div className="grid gap-3">
              <Select value={sport} onChange={(e) => setSport(e.target.value)}>
                {sports.filter((s) => s !== "Alle").map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ort oder Koordinaten" />
              <Select value={visibility} onChange={(e) => setVisibility(e.target.value as Visibility)}>
                <option value="public">Öffentlich</option>
                <option value="friends">Nur Freunde</option>
              </Select>
              <GhostButton onClick={useCurrentLocation}><MapPin size={16} /> Aktuellen Standort nutzen</GhostButton>
              <GreenButton onClick={createSession}><Plus size={16} /> Session erstellen</GreenButton>
            </div>
          </AppCard>

          <AppCard>
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3"><Filter size={18} /></div>
              <div>
                <h2 className="text-lg font-semibold">Sessions filtern</h2>
                <p className="text-sm text-slate-500">Nach Sport, Ort und Sichtbarkeit</p>
              </div>
            </div>
            <div className="grid gap-3">
              <Input value={sessionSearch} onChange={(e) => setSessionSearch(e.target.value)} placeholder="Suche nach Name, Sport oder Ort" />
              <Select value={sessionSportFilter} onChange={(e) => setSessionSportFilter(e.target.value)}>
                {sports.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </Select>
              <Select value={sessionAudienceFilter} onChange={(e) => setSessionAudienceFilter(e.target.value as "all" | Visibility)}>
                <option value="all">Alle Sessions</option>
                <option value="public">Nur öffentlich</option>
                <option value="friends">Nur Freunde</option>
              </Select>
            </div>
          </AppCard>

          <div className="grid gap-4">
            {visibleSessions.length === 0 ? (
              <AppCard>
                <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Keine passenden Sessions vorhanden.</div>
              </AppCard>
            ) : (
              visibleSessions.map((s) => {
                const sessionParticipants = getSessionParticipants(s.id);
                const joined = hasJoined(s.id);
                const owner = user.id === s.user_id;
                const vis = s.visibility === "friends" ? "Nur Freunde" : "Öffentlich";
                const parsed = parseCoordinates(s.location);
                const km = currentCoords && parsed ? distanceKm(currentCoords, parsed) : null;
                return (
                  <AppCard key={s.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="mb-1 flex items-center gap-2 text-sm font-semibold">
                          <span className="rounded-full bg-slate-100 p-2">{sportIcon(s.sport || "")}</span>
                          <span>{s.user_name || "Unbekannt"}</span>
                        </div>
                        <div className="text-base font-semibold">{s.sport || "-"}</div>
                        <div className="mt-1 flex items-center gap-1 text-sm text-slate-500"><MapPin size={14} /> {displayLocation(s.location)}</div>
                        {km !== null && <div className="mt-1 text-sm font-semibold text-emerald-700">{km.toFixed(1)} km entfernt</div>}
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${s.visibility === "friends" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {s.visibility === "friends" ? <Lock size={12} /> : <Globe size={12} />} {vis}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="text-slate-500">Teilnehmer</div>
                        <div className="mt-1 font-semibold">{sessionParticipants.length}</div>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-3">
                        <div className="text-slate-500">Sichtbarkeit</div>
                        <div className="mt-1 font-semibold">{vis}</div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {!owner && !joined && <GreenButton onClick={() => joinSession(s)} className="flex-1"><Check size={16} /> Mitmachen</GreenButton>}
                      <PrimaryButton onClick={() => setActiveChatSessionId(s.id)} className="flex-1"><MessageCircle size={16} /> Chat</PrimaryButton>
                      {parsed && (
                        <GhostButton
                          className="w-full"
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${parsed.lat},${parsed.lng}`,
                              "_blank"
                            )
                          }
                        >
                          <Navigation size={16} /> Route öffnen
                        </GhostButton>
                      )}
                      {owner && <RedButton onClick={() => deleteSession(s.id, s.user_id)} className="w-full"><X size={16} /> Löschen</RedButton>}
                    </div>

                    <div className="mt-4">
                      <div className="mb-2 text-sm font-semibold text-slate-700">Teilnehmerliste</div>
                      <div className="flex flex-wrap gap-2">
                        {sessionParticipants.length === 0 ? (
                          <span className="text-sm text-slate-500">Noch keine Teilnehmer.</span>
                        ) : (
                          sessionParticipants.map((p) => (
                            <span key={p.id} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
                              {p.participant_name || p.participant_email || "Unbekannt"}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </AppCard>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === "sessions" && activeChatSessionId && (
        <AppCard>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveChatSessionId(null)} className="rounded-2xl border border-slate-200 p-3"><ChevronLeft size={18} /></button>
              <div>
                <h2 className="text-lg font-semibold">Session-Chat</h2>
                <p className="text-sm text-slate-500">Nachrichten zur aktuellen Session</p>
              </div>
            </div>
          </div>

          <div className="mb-4 grid max-h-[52vh] gap-3 overflow-y-auto">
            {activeChatMessages.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 p-4 text-sm text-slate-500">Noch keine Nachrichten.</div>
            ) : (
              activeChatMessages.map((m) => (
                <div key={m.id} className={`rounded-2xl border p-3 ${m.user_id === user.id ? "border-emerald-200 bg-emerald-50" : "border-slate-200 bg-slate-50"}`}>
                  <div className="mb-1 text-sm font-semibold">{m.user_name || "Unbekannt"}</div>
                  <div className="text-sm leading-6">{m.message}</div>
                </div>
              ))
            )}
          </div>

          <div className="grid gap-3">
            <Input value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} placeholder="Nachricht schreiben" />
            <GreenButton onClick={sendChatMessage}><Send size={16} /> Senden</GreenButton>
          </div>
        </AppCard>
      )}

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 px-3 py-3 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2">
          <button
            onClick={() => {
              setActiveTab("sessions");
              setActiveChatSessionId(null);
            }}
            className={`rounded-2xl px-3 py-3 text-sm font-semibold ${activeTab === "sessions" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"}`}
          >
            <MapIcon size={16} className="mx-auto mb-1" />
            Sessions
          </button>
          <button
            onClick={() => setActiveTab("friends")}
            className={`rounded-2xl px-3 py-3 text-sm font-semibold ${activeTab === "friends" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"}`}
          >
            <Users size={16} className="mx-auto mb-1" />
            Freunde
          </button>
          <button
            onClick={() => setActiveTab("profile")}
            className={`rounded-2xl px-3 py-3 text-sm font-semibold ${activeTab === "profile" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-700"}`}
          >
            <User size={16} className="mx-auto mb-1" />
            Profil
          </button>
        </div>
      </div>
    </MobileShell>
  );
}
