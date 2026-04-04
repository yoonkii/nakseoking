import { supabase } from "./client";

function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

const PLAYER_AVATARS = ["🐱", "🐶", "🐰", "🦊", "🐻", "🐼", "🐸", "🐵"];

export interface RoomData {
  id: string;
  code: string;
  status: string;
  settings: { rounds: number };
}

export interface PlayerData {
  id: string;
  room_id: string;
  nickname: string;
  avatar: string;
  status: string;
  is_host: boolean;
}

/**
 * Create a new game room and join as host.
 */
export async function createRoom(nickname: string): Promise<{ room: RoomData; player: PlayerData } | null> {
  if (!supabase) return null;

  const code = generateCode();

  const { data: room, error: roomErr } = await supabase
    .from("game_rooms")
    .insert({ code, status: "lobby", settings: { rounds: 5 } })
    .select()
    .single();

  if (roomErr || !room) {
    console.error("Failed to create room:", roomErr);
    return null;
  }

  const { data: player, error: playerErr } = await supabase
    .from("players")
    .insert({
      room_id: room.id,
      nickname,
      avatar: PLAYER_AVATARS[0],
      is_host: true,
      status: "alive",
    })
    .select()
    .single();

  if (playerErr || !player) {
    console.error("Failed to create player:", playerErr);
    return null;
  }

  // Set host_id
  await supabase.from("game_rooms").update({ host_id: player.id }).eq("id", room.id);

  return { room, player };
}

/**
 * Join an existing room by code.
 */
export async function joinRoom(code: string, nickname: string): Promise<{ room: RoomData; player: PlayerData } | null> {
  if (!supabase) return null;

  const { data: room, error: roomErr } = await supabase
    .from("game_rooms")
    .select()
    .eq("code", code.toUpperCase())
    .eq("status", "lobby")
    .single();

  if (roomErr || !room) {
    return null; // Room not found or not in lobby
  }

  // Count existing players
  const { count } = await supabase
    .from("players")
    .select("*", { count: "exact", head: true })
    .eq("room_id", room.id);

  if ((count ?? 0) >= 8) return null; // Room full

  const avatarIndex = (count ?? 0) % PLAYER_AVATARS.length;

  const { data: player, error: playerErr } = await supabase
    .from("players")
    .insert({
      room_id: room.id,
      nickname,
      avatar: PLAYER_AVATARS[avatarIndex],
      is_host: false,
      status: "alive",
    })
    .select()
    .single();

  if (playerErr || !player) {
    console.error("Failed to join:", playerErr);
    return null;
  }

  return { room, player };
}

/**
 * Get room by code.
 */
export async function getRoom(code: string): Promise<RoomData | null> {
  if (!supabase) return null;
  const { data } = await supabase
    .from("game_rooms")
    .select()
    .eq("code", code.toUpperCase())
    .single();
  return data;
}

/**
 * Get players in a room.
 */
export async function getRoomPlayers(roomId: string): Promise<PlayerData[]> {
  if (!supabase) return [];
  const { data } = await supabase
    .from("players")
    .select()
    .eq("room_id", roomId)
    .order("joined_at");
  return data ?? [];
}

/**
 * Subscribe to player changes in a room (join/leave/update).
 */
export function subscribeToPlayers(
  roomId: string,
  callback: (players: PlayerData[]) => void
) {
  if (!supabase) return { unsubscribe: () => {} };

  const channel = supabase
    .channel(`room-${roomId}-players`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "players", filter: `room_id=eq.${roomId}` },
      async () => {
        // Refetch all players on any change
        const players = await getRoomPlayers(roomId);
        callback(players);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase!.removeChannel(channel);
    },
  };
}

/**
 * Subscribe to room status changes.
 */
export function subscribeToRoom(
  roomId: string,
  callback: (room: RoomData) => void
) {
  if (!supabase) return { unsubscribe: () => {} };

  const channel = supabase
    .channel(`room-${roomId}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "game_rooms", filter: `id=eq.${roomId}` },
      (payload) => {
        callback(payload.new as RoomData);
      }
    )
    .subscribe();

  return {
    unsubscribe: () => {
      supabase!.removeChannel(channel);
    },
  };
}

/**
 * Update room status.
 */
export async function updateRoomStatus(roomId: string, status: string) {
  if (!supabase) return;
  await supabase.from("game_rooms").update({ status }).eq("id", roomId);
}
