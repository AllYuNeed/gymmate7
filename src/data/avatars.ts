import warriorGold from "@/assets/avatars/warrior-gold.jpg";
import warriorPrince from "@/assets/avatars/warrior-prince.jpg";
import warriorNamek from "@/assets/avatars/warrior-namek.jpg";
import warriorCrimson from "@/assets/avatars/warrior-crimson.jpg";
import warriorViolet from "@/assets/avatars/warrior-violet.jpg";
import warriorCelestial from "@/assets/avatars/warrior-celestial.jpg";

export interface PresetAvatar {
  id: string;
  name: string;
  src: string;
  aura: string; // tailwind ring color class
}

// Stylised anime warrior portraits — channel the Saiyan / Z-fighter aesthetic
// without referencing any trademarked franchise.
export const PRESET_AVATARS: PresetAvatar[] = [
  { id: "gold",      name: "Solar Saiyan",   src: warriorGold,      aura: "ring-yellow-400" },
  { id: "prince",    name: "Storm Prince",   src: warriorPrince,    aura: "ring-blue-400" },
  { id: "namek",     name: "Green Sage",     src: warriorNamek,     aura: "ring-emerald-400" },
  { id: "crimson",   name: "Crimson Fist",   src: warriorCrimson,   aura: "ring-pink-500" },
  { id: "violet",    name: "Violet Wraith",  src: warriorViolet,    aura: "ring-purple-500" },
  { id: "celestial", name: "Celestial Maid", src: warriorCelestial, aura: "ring-cyan-400" },
];

const PRESET_PREFIX = "preset:";

export const isPresetAvatar = (url: string | null | undefined): boolean =>
  !!url && url.startsWith(PRESET_PREFIX);

export const presetIdToUrl = (id: string) => `${PRESET_PREFIX}${id}`;

/** Resolve any stored avatar_url to a renderable src (handles preset references). */
export const resolveAvatarSrc = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith(PRESET_PREFIX)) {
    const id = url.slice(PRESET_PREFIX.length);
    return PRESET_AVATARS.find((a) => a.id === id)?.src ?? null;
  }
  return url;
};
