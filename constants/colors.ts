export const Colors = {
  primary: {
    coral: "#FF8B7B",
    peach: "#FFB5A5",
    soft: "#FFF5F3",
  },
  secondary: {
    sky: "#6EC1E4",
    mint: "#7FD8BE",
    lavender: "#B4A4E8",
    sunshine: "#FFD66B",
  },
  neutral: {
    darkest: "#2D3748",
    dark: "#4A5568",
    medium: "#718096",
    light: "#A0AEC0",
    lighter: "#E2E8F0",
    lightest: "#F7FAFC",
    white: "#FFFFFF",
  },
  background: {
    primary: "#FDFCFB",
    card: "#FFFFFF",
    overlay: "rgba(0, 0, 0, 0.5)",
  },
  success: "#68D391",
  warning: "#F6AD55",
  error: "#FC8181",
  info: "#63B3ED",
};

export default {
  light: {
    text: Colors.neutral.darkest,
    background: Colors.background.primary,
    tint: Colors.primary.coral,
    tabIconDefault: Colors.neutral.light,
    tabIconSelected: Colors.primary.coral,
  },
};
