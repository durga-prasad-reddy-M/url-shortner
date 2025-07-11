import type React from "react"
import { ThemeProvider } from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import { AppBar, Toolbar, Typography, Box, Button } from "@mui/material"
import { createTheme } from "@mui/material/styles"
import Link from "next/link"

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#dc004e",
    },
  },
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <AppBar position="static" elevation={1}>
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
                  URL Shortener
                </Link>
              </Typography>
              <Button color="inherit" component={Link} href="/">
                Home
              </Button>
              <Button color="inherit" component={Link} href="/stats">
                Statistics
              </Button>
            </Toolbar>
          </AppBar>
          <Box component="main" sx={{ minHeight: "calc(100vh - 64px)", bgcolor: "grey.50" }}>
            {children}
          </Box>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'

export const metadata = {
      generator: 'v0.dev'
    };
