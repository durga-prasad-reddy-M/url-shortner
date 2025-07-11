"use client"

import { useState, useEffect } from "react"
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  Grid,
} from "@mui/material"
import { ContentCopy, Delete, Analytics, Link as LinkIcon } from "@mui/icons-material"

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

export default function URLShortenerPage() {
  const [urls, setUrls] = useState<ShortenedUrl[]>([])
  const [originalUrl, setOriginalUrl] = useState("")
  const [customShortcode, setCustomShortcode] = useState("")
  const [validityPeriod, setValidityPeriod] = useState(30)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  // Load URLs from localStorage on component mount
  useEffect(() => {
    const savedUrls = localStorage.getItem("shortenedUrls")
    if (savedUrls) {
      const parsedUrls = JSON.parse(savedUrls).map((url: any) => ({
        ...url,
        createdAt: new Date(url.createdAt),
        expiresAt: new Date(url.expiresAt),
        isExpired: new Date() > new Date(url.expiresAt),
      }))
      setUrls(parsedUrls)
    }
  }, [])

  // Save URLs to localStorage whenever urls state changes
  useEffect(() => {
    localStorage.setItem("shortenedUrls", JSON.stringify(urls))
  }, [urls])

  // Update expired status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setUrls((prevUrls) =>
        prevUrls.map((url) => ({
          ...url,
          isExpired: new Date() > url.expiresAt,
        })),
      )
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const validateShortcode = (shortcode: string): boolean => {
    if (!shortcode) return true // Optional field
    return /^[a-zA-Z0-9]{3,10}$/.test(shortcode)
  }

  const generateShortcode = (): string => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let result = ""
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const isShortcodeUnique = (shortcode: string): boolean => {
    return !urls.some((url) => url.shortCode === shortcode)
  }

  const handleShortenUrl = async () => {
    setError("")
    setSuccess("")
    setLoading(true)

    try {
      // Client-side validation
      if (!originalUrl.trim()) {
        throw new Error("Please enter a URL to shorten")
      }

      if (!validateUrl(originalUrl)) {
        throw new Error("Please enter a valid URL (include http:// or https://)")
      }

      if (validityPeriod < 1 || validityPeriod > 10080) {
        // Max 1 week
        throw new Error("Validity period must be between 1 and 10080 minutes (1 week)")
      }

      if (customShortcode && !validateShortcode(customShortcode)) {
        throw new Error("Custom shortcode must be 3-10 characters long and contain only letters and numbers")
      }

      if (urls.filter((url) => !url.isExpired).length >= 5) {
        throw new Error("You can only have 5 active shortened URLs at a time")
      }

      // Generate or use custom shortcode
      let shortCode = customShortcode.trim()
      if (!shortCode) {
        do {
          shortCode = generateShortcode()
        } while (!isShortcodeUnique(shortCode))
      } else if (!isShortcodeUnique(shortCode)) {
        throw new Error("This shortcode is already in use. Please choose a different one.")
      }

      // Create new shortened URL
      const now = new Date()
      const expiresAt = new Date(now.getTime() + validityPeriod * 60 * 1000)
      const shortUrl = `http://localhost:3000/${shortCode}`

      const newUrl: ShortenedUrl = {
        id: Date.now().toString(),
        originalUrl: originalUrl.trim(),
        shortCode,
        shortUrl,
        validityMinutes: validityPeriod,
        createdAt: now,
        expiresAt,
        clickCount: 0,
        isExpired: false,
      }

      setUrls((prev) => [newUrl, ...prev])
      setSuccess(`URL shortened successfully! Short URL: ${shortUrl}`)

      // Reset form
      setOriginalUrl("")
      setCustomShortcode("")
      setValidityPeriod(30)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyUrl = (shortUrl: string) => {
    navigator.clipboard.writeText(shortUrl)
    setSuccess("Short URL copied to clipboard!")
    setTimeout(() => setSuccess(""), 3000)
  }

  const handleDeleteUrl = (id: string) => {
    setUrls((prev) => prev.filter((url) => url.id !== id))
    setSuccess("URL deleted successfully!")
    setTimeout(() => setSuccess(""), 3000)
  }

  const formatTimeRemaining = (expiresAt: Date): string => {
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()

    if (diff <= 0) return "Expired"

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h remaining`
    if (hours > 0) return `${hours}h ${minutes % 60}m remaining`
    return `${minutes}m remaining`
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <LinkIcon sx={{ mr: 2, fontSize: 32, color: "primary.main" }} />
          <Typography variant="h4" component="h1" fontWeight="bold">
            URL Shortener
          </Typography>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Shorten your long URLs and track their performance. You can have up to 5 active shortened URLs at a time.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
            {success}
          </Alert>
        )}

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Enter URL to shorten"
              placeholder="https://example.com/very-long-url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              error={originalUrl && !validateUrl(originalUrl)}
              helperText={originalUrl && !validateUrl(originalUrl) ? "Please enter a valid URL" : ""}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Custom shortcode (optional)"
              placeholder="mycode123"
              value={customShortcode}
              onChange={(e) => setCustomShortcode(e.target.value)}
              error={customShortcode && !validateShortcode(customShortcode)}
              helperText={
                customShortcode && !validateShortcode(customShortcode)
                  ? "3-10 characters, letters and numbers only"
                  : "Leave empty for auto-generation"
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Validity period (minutes)"
              value={validityPeriod}
              onChange={(e) => setValidityPeriod(Number.parseInt(e.target.value) || 30)}
              inputProps={{ min: 1, max: 10080 }}
              helperText="Default: 30 minutes, Max: 1 week (10080 minutes)"
            />
          </Grid>
        </Grid>

        <Button
          variant="contained"
          size="large"
          onClick={handleShortenUrl}
          disabled={loading || !originalUrl.trim() || urls.filter((url) => !url.isExpired).length >= 5}
          sx={{ mb: 4 }}
        >
          {loading ? "Shortening..." : "Shorten URL"}
        </Button>

        {urls.filter((url) => !url.isExpired).length >= 5 && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            You have reached the maximum of 5 active shortened URLs. Delete some expired or unused URLs to create new
            ones.
          </Alert>
        )}
      </Paper>

      {urls.length > 0 && (
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
            <Analytics sx={{ mr: 2, color: "primary.main" }} />
            <Typography variant="h5" component="h2" fontWeight="bold">
              Your Shortened URLs
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {urls.map((url) => (
              <Grid item xs={12} key={url.id}>
                <Card
                  variant="outlined"
                  sx={{
                    opacity: url.isExpired ? 0.6 : 1,
                    border: url.isExpired ? "1px solid #f44336" : "1px solid #e0e0e0",
                  }}
                >
                  <CardContent>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                      <Box sx={{ flex: 1, mr: 2 }}>
                        <Typography variant="h6" component="div" sx={{ mb: 1 }}>
                          {url.shortUrl}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1, wordBreak: "break-all" }}>
                          Original: {url.originalUrl}
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                          <Chip label={`${url.clickCount} clicks`} size="small" color="primary" variant="outlined" />
                          <Chip
                            label={formatTimeRemaining(url.expiresAt)}
                            size="small"
                            color={url.isExpired ? "error" : "success"}
                            variant="outlined"
                          />
                          <Typography variant="caption" color="text.secondary">
                            Created: {url.createdAt.toLocaleString()}
                          </Typography>
                        </Box>
                      </Box>

                      <Box sx={{ display: "flex", gap: 1 }}>
                        <Tooltip title="Copy short URL">
                          <IconButton onClick={() => handleCopyUrl(url.shortUrl)} disabled={url.isExpired} size="small">
                            <ContentCopy />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete URL">
                          <IconButton onClick={() => handleDeleteUrl(url.id)} color="error" size="small">
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Container>
  )
}
