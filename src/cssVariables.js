// color namer -> http://chir.ag/projects/name-that-color
//  cubic beziers -> https://easings.net/en

export const colors = {
  fiord: '#3B4D68',
  oxford_blue: '#344256',
  titan_blue: '#FDFDFF',
  alto: '#D9D9D9',
  moon_raker: '#DAE0F9',
  capri: '#01C2F3',
  white: '#fff',
  inch_worm: '#A8DC6F',
  corn: '#FFEB68',
  pastel_red: '#F46464',
  //  brand colors
  // dark_cerulean: '#21477C',
  midnight_blue: '#253E60',
  terra_cotta: '#E47960',
  pale_spring_bud: '#E3EEC5',
  dark_pastel_blue: '#73A8DA',
  gray: '#9B9B9B',
  gainsboro: '#dddddd',
  gray_light: '#d8d8d8',
  quartz: '#4A4A4A',
  white_smoke: '#f6f6f6',
  medium_purple: '#9188DD',
};

export default Object.assign({}, colors, {
  //  roles
  CLR_INFO: colors.fiord,
  CLR_PRIMARY_BG: colors.titan_blue,
  CLR_PRIMARY_BORDER_COLOR: colors.alto,
  CLR_SECONDARY_BG: colors.fiord,
  CLR_SECONDARY_BORDER_COLOR: colors.oxford_blue,
  CLR_TERTIARY: colors.medium_purple,
  // CLR_CTA: colors.capri,
  CLR_CTA: colors.midnight_blue,

  //  semantics colors
  CLR_DANGER: colors.pastel_red,
  CLR_WARNING: colors.corn,
  CLR_SUCCESS: colors.inch_worm,

  //  base colors
  CLR_FIORD: colors.fiord,
  CLR_WHITE: colors.white,
  CLR_MOON_RAKER: colors.moon_raker,
  CLR_GRAY_LIGHT: colors.gray_light,
  CLR_GAINSBORO: colors.gainsboro,
  CLR_WHITE_SMOKE: colors.white_smoke,

  //  brand colors
  CLR_MIDNIGHT_BLUE: colors.midnight_blue,
  CLR_TERRA_COTTA: colors.terra_cotta,
  CLR_PALE_SPRING_BUD: colors.pale_spring_bud,
  CLR_DARK_PASTEL_BLUE: colors.dark_pastel_blue,
  CLR_GRAY: colors.gray,
  CLR_QUARTZ: colors.quartz,
  CLR_MEDIUM_PURPLE: colors.medium_purple,

  //  type scale (using the golden ratio 1.618)
  STEP_UP_4: '2.6179em',
  STEP_UP_3: '2.0581em',
  STEP_UP_2: '1.618em',
  STEP_UP_1: '1.272em',
  STEP_DOWN_1: '0.7861em',
  STEP_DOWN_2: '0.618em',
  STEP_DOWN_3: '0.4856em',
  STEP_DOWN_4: '0.3819em',

  BASE_FONT_SIZE: 1.8,
  BORDER_RADIUS: '0.8rem',
  BORDER_RADIUS_SM: '0.4rem',
  // BOX_SHADOW: '0 18px 35px rgba(50,50,93,.1), 0 8px 15px rgba(0,0,0,.07)',
  BOX_SHADOW_SM: '0 6px 20px rgba(50,50,93,.1), 0 4px 15px rgba(0,0,0,.07)',
  BOX_SHADOW: `0 0 27px 4px ${colors.moon_raker}`,

  //  easings
  ease_out_quint: 'cubic-bezier(0.23, 1, 0.32, 1)',
});
