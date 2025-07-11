"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
} from "@mui/material"
import { Analytics, TrendingUp, Link as LinkIcon, AccessTime, ArrowBack } from "@mui/icons-material"

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

export default function StatsPage() {
  const router = useRouter()
  const [urls, setUrls] = useState<ShortenedUrl[]>([])
  const [stats, setStats] = useState({
    totalUrls: 0,
    activeUrls: 0,
    expiredUrls: 0,
    totalClicks: 0,
    averageClicks: 0,
  })

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

      // Calculate statistics
      const totalUrls = parsedUrls.length
      const activeUrls = parsedUrls.filter((url: ShortenedUrl) => !url.isExpired).length
      const expiredUrls = totalUrls - activeUrls
      const totalClicks = parsedUrls.reduce((sum: number, url: ShortenedUrl) => sum + url.clickCount, 0)
      const averageClicks = totalUrls > 0 ? Math.round((totalClicks / totalUrls) * 100) / 100 : 0

      setStats({
        totalUrls,
        activeUrls,
        expiredUrls,
        totalClicks,
        averageClicks,
      })
    }
  }, [])

  const formatTimeRemaining = (expiresAt: Date): string => {
    const now = new Date()
    const diff = expiresAt.getTime() - now.getTime()

    if (diff <= 0) return "Expired"

    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}d ${hours % 24}h`
    if (hours > 0) return `${hours}h ${minutes % 60}m`
    return `${minutes}m`
  }

  const getClickRate = (url: ShortenedUrl): string => {
    const hoursActive = Math.max(1, Math.floor((new Date().getTime() - url.createdAt.getTime()) / (1000 * 60 * 60)))
    const rate = (url.clickCount / hoursActive).toFixed(2)
    return `${rate} clicks/hour`
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Analytics sx={{ mr: 2, fontSize: 32, color: "primary.main" }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              URL Statistics
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => router.push("/")}>
            Back to Shortener
          </Button>
        </Box>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Comprehensive analytics and insights for all your shortened URLs.
        </Typography>

        {urls.length === 0 ? (
          <Alert severity="info">No shortened URLs found. Create some URLs first to see statistics here.</Alert>
        ) : (
          <>
            {/* Statistics Overview */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={2.4}>
                <Card>
                  <CardContent sx={{ textAlign: "center" }}>
                    <LinkIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">
                      {stats.totalUrls}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total URLs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <Card>
                  <CardContent sx={{ textAlign: "center" }}>
                    <TrendingUp sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="success.main">
                      {stats.activeUrls}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active URLs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <Card>
                  <CardContent sx={{ textAlign: "center" }}>
                    <AccessTime sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {stats.expiredUrls}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expired URLs
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <Card>
                  <CardContent sx={{ textAlign: "center" }}>
                    <Analytics sx={{ fontSize: 40, color: "info.main", mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="info.main">
                      {stats.totalClicks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Clicks
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={2.4}>
                <Card>
                  <CardContent sx={{ textAlign: "center" }}>
                    <TrendingUp sx={{ fontSize: 40, color: "warning.main", mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold" color="warning.main">
                      {stats.averageClicks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Clicks/URL
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Detailed URL Table */}
            <Paper elevation={1}>
              <Typography variant="h6" sx={{ p: 3, pb: 0 }}>
                Detailed URL Analytics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Short URL</TableCell>
                      <TableCell>Original URL</TableCell>
                      <TableCell align="center">Clicks</TableCell>
                      <TableCell align="center">Click Rate</TableCell>
                      <TableCell align="center">Status</TableCell>
                      <TableCell align="center">Time Remaining</TableCell>
                      <TableCell align="center">Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {urls
                      .sort((a, b) => b.clickCount - a.clickCount)
                      .map((url) => (
                        <TableRow key={url.id} sx={{ opacity: url.isExpired ? 0.6 : 1 }}>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {url.shortCode}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              sx={{
                                maxWidth: 200,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={url.originalUrl}
                            >
                              {url.originalUrl}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={url.clickCount}
                              size="small"
                              color={url.clickCount > 0 ? "primary" : "default"}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="text.secondary">
                              {getClickRate(url)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={url.isExpired ? "Expired" : "Active"}
                              size="small"
                              color={url.isExpired ? "error" : "success"}
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color={url.isExpired ? "error.main" : "text.secondary"}>
                              {formatTimeRemaining(url.expiresAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="body2" color="text.secondary">
                              {url.createdAt.toLocaleDateString()}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}
      </Paper>
    </Container>
  )
}
