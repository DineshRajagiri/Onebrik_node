/**
 * Ghibli-style personality avatars users can pick for their profile.
 * Use avatarId in PATCH /auth/customer/profile, or pass your own avatarUrl.
 * Replace URLs with your own hosted Ghibli assets (e.g. from ghibli.jp free image library) if desired.
 */
export const GHIBLI_AVATARS = [
  { id: 'totoro', name: 'Totoro', url: 'https://i.pravatar.cc/300?img=1' },
  { id: 'chihiro', name: 'Chihiro', url: 'https://i.pravatar.cc/300?img=2' },
  { id: 'ponyo', name: 'Ponyo', url: 'https://i.pravatar.cc/300?img=3' },
  { id: 'sophie', name: 'Sophie', url: 'https://i.pravatar.cc/300?img=4' },
  { id: 'howl', name: 'Howl', url: 'https://i.pravatar.cc/300?img=5' },
  { id: 'kiki', name: 'Kiki', url: 'https://i.pravatar.cc/300?img=6' },
  { id: 'san', name: 'San', url: 'https://i.pravatar.cc/300?img=7' },
  { id: 'ashitaka', name: 'Ashitaka', url: 'https://i.pravatar.cc/300?img=8' },
  { id: 'no-face', name: 'No-Face', url: 'https://i.pravatar.cc/300?img=9' },
  { id: 'haku', name: 'Haku', url: 'https://i.pravatar.cc/300?img=10' },
] as const;

export type GhibliAvatarId = (typeof GHIBLI_AVATARS)[number]['id'];

export function getGhibliAvatarUrlById(id: string): string | undefined {
  return GHIBLI_AVATARS.find((a) => a.id === id)?.url;
}
