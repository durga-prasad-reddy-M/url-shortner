"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Container, Paper, Typography, CircularProgress, Alert, Box } from "@mui/material"
import { Error as ErrorIcon } from "@mui/icons-material"

interface ShortenedUrl {
  id: string
  originalUrl: string
  shortCode: string
  shortUrl: string
  validityMinutes: number
  createdAt: Date
  expiresAt: Date
  clickCount: number
  isExpired: boolean
}

export default function RedirectPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const shortcode = params.shortcode as string

  useEffect(() => {
    const handleRedirect = () => {
      try {
        const savedUrls = localStorage.getItem("shortenedUrls")
        if (!savedUrls) {
          setError("Short URL not found")
          setLoading(false)
          return
        }

        const urls: ShortenedUrl[] = JSON.parse(savedUrls).map((url: any) => ({
          ...url,
          createdAt: new Date(url.createdAt),
          expiresAt: new Date(url.expiresAt),
          isExpired: new Date() > new Date(url.expiresAt),
        }))

        const foundUrl = urls.find((url) => url.shortCode === shortcode)

        if (!foundUrl) {
          setError("Short URL not found")
          setLoading(false)
          return
        }

        if (foundUrl.isExpired) {
          setError("This short URL has expired")
          setLoading(false)
          return
        }

        // Increment click count
        const updatedUrls = urls.map((url) =>
          url.id === foundUrl.id ? { ...url, clickCount: url.clickCount + 1 } : url,
        )
        localStorage.setItem("shortenedUrls", JSON.stringify(updatedUrls))

        // Log click data (as required)
        console.log("Click Data:", {
          timestamp: new Date().toISOString(),
          shortCode: foundUrl.shortCode,
          originalUrl: foundUrl.originalUrl,
          clickCount: foundUrl.clickCount + 1,
          source: window.location.href,
          userAgent: navigator.userAgent,
          // Note: Geolocation would require additional permissions and APIs
          location: "Location tracking would require geolocation API",
        })

        // Redirect to original URL
        window.location.href = foundUrl.originalUrl
      } catch (err) {
        setError("An error occurred while processing the redirect")
        setLoading(false)
      }
    }

    // Small delay to show loading state
    const timer = setTimeout(handleRedirect, 1000)
    return () => clearTimeout(timer)
  }, [shortcode])

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
        <Paper elevation={3} sx={{ p: 6 }}>
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" sx={{ mb: 2 }}>
            Redirecting...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Please wait while we redirect you to your destination.
          </Typography>
        </Paper>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8, textAlign: "center" }}>
      <Paper elevation={3} sx={{ p: 6 }}>
        <ErrorIcon sx={{ fontSize: 60, color: "error.main", mb: 3 }} />
        <Typography variant="h5" sx={{ mb: 2 }}>
          Redirect Failed
        </Typography>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Typography variant="body1" color="text.secondary">
          The short URL you're trying to access is either invalid, expired, or has been removed.
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography
            variant="body2"
            color="primary"
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => router.push("/")}
          >
            Go back to URL Shortener
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}
