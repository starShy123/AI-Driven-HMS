import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, requireRole } from '@/lib/auth'
import { asyncHandler, handleApiError, handleAIError } from '@/utils/errors'
import { formatApiResponse } from '@/utils/helpers'
import { predictDiseaseTrends } from '@/lib/ai'
import { UserRole } from '@prisma/client'

// POST /api/disease-trends/predict - Generate disease trend predictions using AI
export const POST = async (request: NextRequest) => {
  try {
    const user = await requireRole(request, [UserRole.ADMIN, UserRole.HEALTHCARE_WORKER])
    
    const body = await request.json()
    const { region, timeFrame = '30 days', diseaseName } = body
    
    if (!region) {
      return NextResponse.json(
        { success: false, message: 'Region is required' },
        { status: 400 }
      )
    }
    
    // Get recent disease data for the region to provide context to AI
    const recentData = await prisma.diseaseTracking.findMany({
      where: {
        region: {
          contains: region,
          mode: 'insensitive'
        },
        reportedDate: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
        }
      },
      orderBy: { reportedDate: 'desc' },
      take: 50 // Limit to recent 50 records
    })
    
    // If specific disease is requested, filter further
    let filteredData = recentData
    if (diseaseName) {
      filteredData = recentData.filter(d => 
        d.diseaseName.toLowerCase().includes(diseaseName.toLowerCase())
      )
    }
    
    // Generate AI prediction
    let prediction
    try {
      prediction = await predictDiseaseTrends(region, timeFrame)
    } catch (aiError) {
      handleAIError(aiError, 'disease trend prediction')
      return NextResponse.json(
        { success: false, message: 'Disease trend prediction failed' },
        { status: 500 }
      )
    }
    
    // Calculate statistics from recent data
    const stats = {
      totalDiseases: new Set(filteredData.map(d => d.diseaseName)).size,
      totalCases: filteredData.reduce((sum, d) => sum + d.reportedCases, 0),
      highRiskDiseases: filteredData.filter(d => d.riskLevel === 'high').length,
      increasingTrends: filteredData.filter(d => d.trendDirection === 'increasing').length,
      dataPoints: filteredData.length,
      dateRange: filteredData.length > 0 ? {
        earliest: filteredData[filteredData.length - 1].reportedDate,
        latest: filteredData[0].reportedDate,
      } : null,
    }
    
    // Group diseases by name for trend analysis
    const diseaseGroups = filteredData.reduce((acc, item) => {
      if (!acc[item.diseaseName]) {
        acc[item.diseaseName] = []
      }
      acc[item.diseaseName].push(item)
      return acc
    }, {} as Record<string, typeof filteredData>)
    
    // Calculate trends for each disease
    const diseaseTrends = Object.entries(diseaseGroups).map(([name, records]) => {
      const sortedRecords = records.sort((a, b) => 
        new Date(a.reportedDate).getTime() - new Date(b.reportedDate).getTime()
      )
      
      const totalCases = records.reduce((sum, r) => sum + r.reportedCases, 0)
      const avgCases = Math.round(totalCases / records.length)
      const latestRecord = sortedRecords[sortedRecords.length - 1]
      
      return {
        diseaseName: name,
        totalCases,
        averageCases: avgCases,
        currentRiskLevel: latestRecord.riskLevel,
        currentTrend: latestRecord.trendDirection,
        dataPoints: records.length,
      }
    }).sort((a, b) => b.totalCases - a.totalCases)
    
    return NextResponse.json(
      formatApiResponse({
        region,
        timeFrame,
        diseaseName,
        prediction,
        statistics: stats,
        diseaseTrends: diseaseTrends.slice(0, 10), // Top 10 diseases
        dataSource: 'Recent tracking data + AI prediction',
        generatedAt: new Date(),
      }, 'Disease trend prediction generated successfully')
    )
    
  } catch (error) {
    const apiError = handleApiError(error)
    return NextResponse.json(apiError, { status: 500 })
  }
};