import { extendTheme, ThemeConfig } from "@chakra-ui/react";

// Configure the theme to start in dark mode
const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: "#f5f7ff",
      100: "#e2e8f0",
      200: "#cbd5e0",
      300: "#a0aec0",
      400: "#718096",
      500: "#4a5568",
      600: "#2d3748",
      700: "#1a202c",  // Dark background color
      800: "#171923",
      900: "#0f111a",
    },
    danger: "#E57A44",
  },
});

export default theme;
