/**
 * Bilinçli Kahraman — tasarım tokenları.
 * Işıltılı cam (glassmorphism) sistemi: pastel aurora zemin üzerinde buzlu cam yüzeyler.
 * Kural: bileşenlerde ham hex yok; yalnız bu dosyadaki semantik tokenlar kullanılır.
 */

export const palette = {
  ink: '#17233F',
  inkSoft: '#5B6B8F',
  inkFaint: '#8C99B5',
  white: '#FFFFFF',

  primary: '#5B6BF5',
  primaryDeep: '#7C5CF0',
  primarySoft: '#EAE8FF',

  reward: '#F5A524',
  rewardDeep: '#E89010',
  rewardSoft: '#FFF3D6',

  success: '#15A36D',
  successSoft: '#DCF7EC',

  coral: '#F26B55',
  coralSoft: '#FFE9E2',

  sky: '#3AA7F0',
  skySoft: '#E2F2FE',

  mint: '#2BBFA0',
  mintSoft: '#DFF7F1',

  lavender: '#9B7BF7',
  lavenderSoft: '#F0EAFE',

  amber: '#F5A524',
  amberSoft: '#FFF3D6',
  track: 'rgba(23,35,63,0.10)',
} as const;

/** Sıralama madalyaları — yalnız ilk üç derece (§16). */
export const medal = {
  gold: '#E89010',
  goldSoft: '#FFF0C8',
  silver: '#8293B4',
  silverSoft: '#EDF1F8',
  bronze: '#C77B3F',
  bronzeSoft: '#F9E7D6',
} as const;

/** Gölge ön ayarları — kartlar ve aksiyonlar için tek ölçek. */
export const shadows = {
  card: {
    shadowColor: 'rgba(23,35,63,0.12)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 6,
  },
  soft: {
    shadowColor: 'rgba(23,35,63,0.08)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 14,
    elevation: 3,
  },
  glow: {
    shadowColor: 'rgba(91,107,245,0.45)',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 8,
  },
  glowReward: {
    shadowColor: 'rgba(245,165,36,0.4)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 6,
  },
} as const;

export const surface = {
  bgBase: '#F4F8FF',
  glass: 'rgba(255,255,255,0.55)',
  glassStrong: 'rgba(255,255,255,0.74)',
  glassSubtle: 'rgba(255,255,255,0.36)',
  glassBorder: 'rgba(255,255,255,0.92)',
  glassBorderSoft: 'rgba(255,255,255,0.6)',
  track: 'rgba(23,35,63,0.10)',
  scrim: 'rgba(23,35,63,0.38)',
} as const;

export const shadow = {
  color: 'rgba(23,35,63,0.12)',
  colorSoft: 'rgba(23,35,63,0.07)',
  colorStrong: 'rgba(23,35,63,0.2)',
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 24,
  xl: 28,
  card: 28,
  button: 22,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  giant: 56,
} as const;

export const fonts = {
  display: 'Baloo2_700Bold',
  displaySemi: 'Baloo2_600SemiBold',
  body: 'Nunito_400Regular',
  bodySemi: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  bodyBlack: 'Nunito_800ExtraBold',
  /** Sertifikanın klasik serif başlığı. */
  serif: 'PlayfairDisplay_700Bold',
  serifText: 'PlayfairDisplay_400Regular',
  /** Belge sahibinin adı: el yazısı. */
  script: 'DancingScript_700Bold',
} as const;

/**
 * Sertifika paleti — klasik belge dili: fildişi zemin, lacivert yazı,
 * çift altın çerçeve ve kızıl balmumu mühür.
 */
export const certificate = {
  paper: '#FBF4E4',
  paperEdge: '#F4E8CE',
  ink: '#17233F',
  inkSoft: '#3C4A68',
  gold: '#C9A227',
  goldDeep: '#9C7A16',
  goldSoft: '#E7CE7A',
  seal: '#A32020',
  sealDeep: '#7A1616',
} as const;

export const type = {
  display: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40 },
  h1: { fontFamily: fonts.display, fontSize: 27, lineHeight: 33 },
  h2: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28 },
  h3: { fontFamily: fonts.display, fontSize: 18, lineHeight: 24 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  bodySemi: { fontFamily: fonts.bodySemi, fontSize: 16, lineHeight: 23 },
  bodyBold: { fontFamily: fonts.bodyBold, fontSize: 16, lineHeight: 23 },
  label: { fontFamily: fonts.bodyBold, fontSize: 14, lineHeight: 19 },
  caption: { fontFamily: fonts.bodySemi, fontSize: 13, lineHeight: 18 },
  overline: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  button: { fontFamily: fonts.display, fontSize: 17, lineHeight: 22 },
  score: { fontFamily: fonts.display, fontSize: 30, lineHeight: 34 },
} as const;

export const motion = {
  fast: 140,
  base: 220,
  slow: 340,
  exitFactor: 0.6,
  stagger: 45,
  pressScale: 0.96,
} as const;

export const layout = {
  maxContentWidth: 560,
  screenPadding: 20,
  screenPaddingCompact: 16,
  compactWidth: 360,
  tabletWidth: 700,
  tabBarHeight: 62,
  buttonHeight: 56,
  buttonHeightSmall: 48,
  optionHeight: 64,
  inputHeight: 56,
  headerHeight: 56,
} as const;

export const blur = {
  glass: 24,
  glassStrong: 40,
  aurora: 60,
} as const;

/** Konu aksan renkleri — konu id'sine göre güvenli erişim. */
export const topicAccents = {
  sky: { main: palette.sky, soft: palette.skySoft },
  mint: { main: palette.mint, soft: palette.mintSoft },
  coral: { main: palette.coral, soft: palette.coralSoft },
  lavender: { main: palette.lavender, soft: palette.lavenderSoft },
  amber: { main: palette.amber, soft: palette.amberSoft },
} as const;

export type TopicAccent = keyof typeof topicAccents;
