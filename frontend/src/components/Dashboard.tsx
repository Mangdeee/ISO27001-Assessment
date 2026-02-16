import React, { useEffect, useState, useMemo } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Card,
  CardContent,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { gapAssessmentService, maturityAssessmentService, actionItemService } from '../services/api';
import { GapAssessment, MaturityAssessment, ActionItem } from '../types';

const COLORS = {
  'Fully Compliant': '#4caf50',
  'Partially Compliant': '#ff9800',
  'Not Compliant': '#f44336',
  'Not Applicable': '#9e9e9e',
};


const Dashboard: React.FC = () => {
  const [gapData, setGapData] = useState<GapAssessment[]>([]);
  const [maturityData, setMaturityData] = useState<MaturityAssessment[]>([]);
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch data separately to handle partial failures gracefully
        const [gapResponse, maturityResponse, actionItemsResponse] = await Promise.allSettled([
          gapAssessmentService.getAll(),
          maturityAssessmentService.getAll(),
          actionItemService.getAll(),
        ]);
        
        if (gapResponse.status === 'fulfilled') {
          // Ensure we always set an array, even if the API returns null
          setGapData(Array.isArray(gapResponse.value.data) ? gapResponse.value.data : []);
        } else {
          console.error('Error fetching gap assessments:', gapResponse.reason);
          setGapData([]);
        }
        
        if (maturityResponse.status === 'fulfilled') {
          // Ensure we always set an array, even if the API returns null
          setMaturityData(Array.isArray(maturityResponse.value.data) ? maturityResponse.value.data : []);
        } else {
          console.error('Error fetching maturity assessments:', maturityResponse.reason);
          setMaturityData([]);
        }
        
        if (actionItemsResponse.status === 'fulfilled') {
          // Ensure we always set an array, even if the API returns null
          setActionItems(Array.isArray(actionItemsResponse.value.data) ? actionItemsResponse.value.data : []);
        } else {
          console.error('Error fetching action items:', actionItemsResponse.reason);
          setActionItems([]);
        }
      } catch (error) {
        console.error('Unexpected error fetching data:', error);
        // Set empty arrays on error to prevent crashes
        setGapData([]);
        setMaturityData([]);
        setActionItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Gap Assessment Statistics - moved before conditional returns
  const gapComplianceStats = useMemo(() => {
    if (!Array.isArray(gapData) || gapData.length === 0) {
      return {} as Record<string, number>;
    }
    return gapData.reduce((acc, item) => {
      acc[item.compliance] = (acc[item.compliance] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [gapData]);

  const gapChartData = useMemo(() => {
    return Object.entries(gapComplianceStats).map(([name, value]) => ({
      name,
      value,
    }));
  }, [gapComplianceStats]);

  const totalGapItems = Array.isArray(gapData) ? gapData.length : 0;
  const fullyCompliant = gapComplianceStats['Fully Compliant'] || 0;
  const partiallyCompliant = gapComplianceStats['Partially Compliant'] || 0;
  const notCompliant = gapComplianceStats['Not Compliant'] || 0;
  const notApplicable = gapComplianceStats['Not Applicable'] || 0;
  const compliancePercentage = totalGapItems > 0
    ? ((fullyCompliant / totalGapItems) * 100).toFixed(1)
    : '0';

  // Maturity Assessment Statistics - moved before conditional returns
  const maturityStats = useMemo(() => {
    if (!Array.isArray(maturityData) || maturityData.length === 0) {
      return {
        total: 0,
        avgCurrent: 0,
        avgTarget: 0,
        currentScores: [] as number[],
        targetScores: [] as number[],
      };
    }
    return maturityData.reduce((acc, item) => {
      const currentScore = item.current_maturity_score || 0;
      const targetScore = item.target_maturity_score || 0;
      acc.total += 1;
      acc.avgCurrent += currentScore;
      acc.avgTarget += targetScore;
      acc.currentScores.push(currentScore);
      acc.targetScores.push(targetScore);
      return acc;
    }, {
      total: 0,
      avgCurrent: 0,
      avgTarget: 0,
      currentScores: [] as number[],
      targetScores: [] as number[],
    });
  }, [maturityData]);

  const avgCurrentMaturity = maturityStats.total > 0
    ? (maturityStats.avgCurrent / maturityStats.total).toFixed(2)
    : '0.00';
  const avgTargetMaturity = maturityStats.total > 0
    ? (maturityStats.avgTarget / maturityStats.total).toFixed(2)
    : '0.00';

  // Maturity level distribution
  const maturityLevelDistribution = useMemo(() => {
    if (!Array.isArray(maturityData) || maturityData.length === 0) {
      return {} as Record<string, number>;
    }
    return maturityData.reduce((acc, item) => {
      const level = item.current_maturity_level || 'Not Set';
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [maturityData]);

  const maturityChartData = useMemo(() => {
    return Object.entries(maturityLevelDistribution)
      .map(([name, value]) => {
        // Create shorter labels for better display
        let shortName = name;
        if (name.includes('3 - Yes, Consistent but no met')) {
          shortName = '3 - Consistent (no metrics)';
        } else if (name.includes('2 - Yes, documented but')) {
          shortName = '2 - Documented (inconsistent)';
        } else if (name.includes('1 - Yes, but ad')) {
          shortName = '1 - Ad hoc';
        } else if (name.includes('4 - Yes, measured')) {
          shortName = '4 - Measured & managed';
        } else if (name.includes('0 - No')) {
          shortName = '0 - No';
        } else if (name.includes('NA - Not Applicable')) {
          shortName = 'NA - Not Applicable';
        }
        return {
          name: shortName,
          value,
          fullName: name,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [maturityLevelDistribution]);

  // Current vs Target comparison
  const maturityComparisonData = useMemo(() => {
    return [
      {
        name: 'Current',
        value: parseFloat(avgCurrentMaturity),
      },
      {
        name: 'Target',
        value: parseFloat(avgTargetMaturity),
      },
    ];
  }, [avgCurrentMaturity, avgTargetMaturity]);

  // Progress calculation
  const maturityProgress = maturityStats.total > 0 && parseFloat(avgTargetMaturity) > 0
    ? (parseFloat(avgCurrentMaturity) / parseFloat(avgTargetMaturity)) * 100
    : 0;

  // Clause Progress Analysis - moved before conditional returns
  const clauseProgress = useMemo(() => {
    const clauseMap = new Map<string, {
      section: string;
      standardRefs: Set<string>;
      gapItems: GapAssessment[];
      maturityItems: MaturityAssessment[];
      gapStats: {
        total: number;
        fullyCompliant: number;
        partiallyCompliant: number;
        notCompliant: number;
        notApplicable: number;
      };
      maturityStats: {
        total: number;
        avgCurrent: number;
        avgTarget: number;
        currentScores: number[];
        targetScores: number[];
      };
    }>();

    // Process gap assessments
    if (Array.isArray(gapData)) {
      gapData.forEach((item) => {
      const key = item.section;
      if (!clauseMap.has(key)) {
        clauseMap.set(key, {
          section: item.section,
          standardRefs: new Set(),
          gapItems: [],
          maturityItems: [],
          gapStats: {
            total: 0,
            fullyCompliant: 0,
            partiallyCompliant: 0,
            notCompliant: 0,
            notApplicable: 0,
          },
          maturityStats: {
            total: 0,
            avgCurrent: 0,
            avgTarget: 0,
            currentScores: [],
            targetScores: [],
          },
        });
      }
      const clause = clauseMap.get(key)!;
      clause.gapItems.push(item);
      clause.standardRefs.add(item.standard_ref);
      clause.gapStats.total++;
      if (item.compliance === 'Fully Compliant') clause.gapStats.fullyCompliant++;
      else if (item.compliance === 'Partially Compliant') clause.gapStats.partiallyCompliant++;
      else if (item.compliance === 'Not Compliant') clause.gapStats.notCompliant++;
      else if (item.compliance === 'Not Applicable') clause.gapStats.notApplicable++;
      });
    }

    // Process maturity assessments
    if (Array.isArray(maturityData)) {
      maturityData.forEach((item) => {
      const key = item.section;
      if (!clauseMap.has(key)) {
        clauseMap.set(key, {
          section: item.section,
          standardRefs: new Set(),
          gapItems: [],
          maturityItems: [],
          gapStats: {
            total: 0,
            fullyCompliant: 0,
            partiallyCompliant: 0,
            notCompliant: 0,
            notApplicable: 0,
          },
          maturityStats: {
            total: 0,
            avgCurrent: 0,
            avgTarget: 0,
            currentScores: [],
            targetScores: [],
          },
        });
      }
      const clause = clauseMap.get(key)!;
      clause.maturityItems.push(item);
      clause.standardRefs.add(item.standard_ref);
      clause.maturityStats.total++;
      const currentScore = item.current_maturity_score || 0;
      const targetScore = item.target_maturity_score || 0;
      clause.maturityStats.avgCurrent += currentScore;
      clause.maturityStats.avgTarget += targetScore;
      clause.maturityStats.currentScores.push(currentScore);
      clause.maturityStats.targetScores.push(targetScore);
      });
    }

    // Calculate percentages and averages
    return Array.from(clauseMap.values()).map((clause) => {
      const gapCompliancePercent = clause.gapStats.total > 0
        ? (clause.gapStats.fullyCompliant / clause.gapStats.total) * 100
        : 0;
      const avgCurrent = clause.maturityStats.total > 0
        ? clause.maturityStats.avgCurrent / clause.maturityStats.total
        : 0;
      const avgTarget = clause.maturityStats.total > 0
        ? clause.maturityStats.avgTarget / clause.maturityStats.total
        : 0;
      const maturityProgressPercent = avgTarget > 0
        ? (avgCurrent / avgTarget) * 100
        : 0;

      return {
        ...clause,
        gapCompliancePercent,
        avgCurrent: avgCurrent.toFixed(2),
        avgTarget: avgTarget.toFixed(2),
        maturityProgressPercent,
        standardRefs: Array.from(clause.standardRefs).sort(),
      };
    }).sort((a, b) => {
      // Sort by section number if possible
      const aNum = parseInt(a.section) || 999;
      const bNum = parseInt(b.section) || 999;
      return aNum - bNum;
    });
  }, [gapData, maturityData]);

  // All hooks must be called before any conditional returns
  // Now we can safely return conditionally
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  // Safety check - if data is empty and not loading, show message
  if ((!Array.isArray(gapData) || gapData.length === 0) && (!Array.isArray(maturityData) || maturityData.length === 0)) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          No Data Available
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Please ensure the backend is running and data has been imported.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4, width: '100%' }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 1,
            fontWeight: 600,
            color: '#1a237e',
            letterSpacing: '-0.02em'
          }}
        >
          ISO 27001 Assessment Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '0.95rem' }}>
          Comprehensive overview of compliance and maturity assessments
        </Typography>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0}
            sx={{ 
              backgroundColor: '#6366f1',
              color: 'white',
              borderRadius: 3,
              height: '100%',
              minHeight: 160,
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(99, 102, 241, 0.2)'
              }
            }}
          >
            <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography 
                variant="overline" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  mb: 1,
                  display: 'block'
                }}
              >
                Total Gap Assessments
              </Typography>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700,
                  mb: 0.5
                }}
              >
                {totalGapItems}
              </Typography>
              <Box sx={{ height: 20 }} /> {/* Spacer for consistent height */}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0}
            sx={{ 
              backgroundColor: '#10b981',
              color: 'white',
              borderRadius: 3,
              height: '100%',
              minHeight: 160,
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
              }
            }}
          >
            <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography 
                variant="overline" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  mb: 1,
                  display: 'block'
                }}
              >
                Fully Compliant
              </Typography>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700,
                  mb: 0.5
                }}
              >
                {fullyCompliant}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                {compliancePercentage}% of total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0}
            sx={{ 
              backgroundColor: '#3b82f6',
              color: 'white',
              borderRadius: 3,
              height: '100%',
              minHeight: 160,
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
              }
            }}
          >
            <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography 
                variant="overline" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  mb: 1,
                  display: 'block'
                }}
              >
                Avg Current Maturity
              </Typography>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700,
                  mb: 0.5
                }}
              >
                {avgCurrentMaturity}
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.95)',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                out of 5.0
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            elevation={0}
            sx={{ 
              backgroundColor: '#8b5cf6',
              color: 'white',
              borderRadius: 3,
              height: '100%',
              minHeight: 160,
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.2)'
              }
            }}
          >
            <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <Typography 
                variant="overline" 
                sx={{ 
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  mb: 1,
                  display: 'block'
                }}
              >
                Avg Target Maturity
              </Typography>
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700,
                  mb: 1
                }}
              >
                {avgTargetMaturity}
              </Typography>
              <Box>
                <LinearProgress
                  variant="determinate"
                  value={maturityProgress}
                  sx={{ 
                    height: 6, 
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.25)',
                    mb: 0.5,
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: 'white',
                      borderRadius: 3
                    }
                  }}
                />
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: 'rgba(255, 255, 255, 0.95)',
                    fontSize: '0.75rem',
                    fontWeight: 500
                  }}
                >
                  {maturityProgress.toFixed(1)}% progress
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row 1 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Gap Assessment Compliance Pie Chart */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'white'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                fontWeight: 600,
                color: '#1a237e',
                fontSize: '1.1rem'
              }}
            >
              Gap Assessment Compliance Distribution
            </Typography>
            {gapChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={gapChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent, value }) => `${name}\n${value} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    fontSize={12}
                    fontWeight={500}
                  >
                    {gapChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number, name: string) => [
                      `${value} items`,
                      name
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="textSecondary">No data available</Typography>
              </Box>
            )}
            <Box sx={{ mt: 3 }}>
              {gapChartData.map((item) => (
                <Box
                  key={item.name}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    p: 1.5,
                    borderRadius: 2,
                    backgroundColor: 'grey.50',
                    transition: 'background-color 0.2s',
                    '&:hover': {
                      backgroundColor: 'grey.100'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: COLORS[item.name as keyof typeof COLORS] || '#8884d8',
                        mr: 1.5,
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        color: 'text.primary'
                      }}
                    >
                      {item.name}
                    </Typography>
                  </Box>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      fontWeight: 700,
                      color: 'text.primary',
                      fontSize: '0.95rem'
                    }}
                  >
                    {item.value}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Gap Assessment Compliance Bar Chart */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                fontWeight: 600,
                color: '#1a237e',
                fontSize: '1.1rem'
              }}
            >
              Gap Assessment Compliance (Bar Chart)
            </Typography>
            {gapChartData.length > 0 ? (
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={gapChartData}
                    margin={{ top: 10, right: 10, left: 10, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis 
                      dataKey="name" 
                      angle={0} 
                      textAnchor="middle"
                      tick={{ fontSize: 12, fill: '#666' }}
                      height={60}
                      interval={0}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: '#666' }}
                      label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle', fill: '#666' } }}
                    />
                    <Tooltip 
                      formatter={(value: number) => [`${value} items`, 'Count']}
                      contentStyle={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                    <Bar 
                      dataKey="value" 
                      radius={[8, 8, 0, 0]}
                      label={{ 
                        position: 'top', 
                        formatter: (value: number) => value,
                        style: { fill: '#333', fontSize: '12px', fontWeight: 600 }
                      }}
                    >
                      {gapChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[entry.name as keyof typeof COLORS] || '#8884d8'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography color="textSecondary">No data available</Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Charts Row 2 */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Maturity Level Distribution */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 3, 
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'white',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2,
                fontWeight: 600,
                color: '#1a237e',
                fontSize: '1.1rem'
              }}
            >
              Current Maturity Level Distribution
            </Typography>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={maturityChartData}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 140, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 12, fill: '#666' }}
                    label={{ value: 'Count', position: 'insideBottom', offset: -5, style: { textAnchor: 'middle', fill: '#666' } }}
                  />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={130}
                    tick={{ fontSize: 11, fill: '#333', fontWeight: 500 }}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value} items`, 'Count']}
                    labelFormatter={(label) => {
                      const item = maturityChartData.find(d => d.name === label);
                      return item?.fullName || label;
                    }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #ccc',
                      borderRadius: '4px',
                      padding: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#3b82f6"
                    radius={[0, 8, 8, 0]}
                    label={{ 
                      position: 'right', 
                      formatter: (value: number) => value,
                      style: { fill: '#333', fontSize: '12px', fontWeight: 600 }
                    }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        {/* Current vs Target Maturity Comparison */}
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4, 
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'white'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                fontWeight: 600,
                color: '#1a237e',
                fontSize: '1.1rem'
              }}
            >
              Current vs Target Maturity
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={maturityComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#4caf50" name="Maturity Score" />
              </BarChart>
            </ResponsiveContainer>
            <Box 
              sx={{ 
                mt: 3, 
                p: 2.5, 
                bgcolor: 'primary.50', 
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'primary.200'
              }}
            >
              <Typography 
                variant="body2" 
                gutterBottom
                sx={{ 
                  fontWeight: 500,
                  color: 'text.primary',
                  mb: 1
                }}
              >
                <strong>Gap to Target:</strong>{' '}
                <Box component="span" color="primary.main" fontWeight={600}>
                  {(parseFloat(avgTargetMaturity) - parseFloat(avgCurrentMaturity)).toFixed(2)} points
                </Box>
              </Typography>
              <Typography 
                variant="body2"
                sx={{ 
                  fontWeight: 500,
                  color: 'text.primary'
                }}
              >
                <strong>Progress:</strong>{' '}
                <Box component="span" color="primary.main" fontWeight={600}>
                  {maturityProgress.toFixed(1)}% towards target
                </Box>
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Detailed Statistics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'white'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                fontWeight: 600,
                color: '#1a237e',
                fontSize: '1.1rem'
              }}
            >
              Gap Assessment Details
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    color: 'text.primary'
                  }}
                >
                  Fully Compliant
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 700,
                    color: 'success.main',
                    fontSize: '0.95rem'
                  }}
                >
                  {fullyCompliant} ({((fullyCompliant / totalGapItems) * 100).toFixed(1)}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={totalGapItems > 0 ? (fullyCompliant / totalGapItems) * 100 : 0}
                color="success"
                sx={{ height: 10, borderRadius: 5, mb: 3 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    color: 'text.primary'
                  }}
                >
                  Partially Compliant
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 700,
                    color: 'warning.main',
                    fontSize: '0.95rem'
                  }}
                >
                  {partiallyCompliant} ({((partiallyCompliant / totalGapItems) * 100).toFixed(1)}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={totalGapItems > 0 ? (partiallyCompliant / totalGapItems) * 100 : 0}
                color="warning"
                sx={{ height: 10, borderRadius: 5, mb: 3 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, alignItems: 'center' }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 500,
                    color: 'text.primary'
                  }}
                >
                  Not Compliant
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    fontWeight: 700,
                    color: 'error.main',
                    fontSize: '0.95rem'
                  }}
                >
                  {notCompliant} ({((notCompliant / totalGapItems) * 100).toFixed(1)}%)
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={totalGapItems > 0 ? (notCompliant / totalGapItems) * 100 : 0}
                color="error"
                sx={{ height: 10, borderRadius: 5, mb: notApplicable > 0 ? 3 : 0 }}
              />
              {notApplicable > 0 && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5, mt: 2, alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 500,
                        color: 'text.primary'
                      }}
                    >
                      Not Applicable
                    </Typography>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 700,
                        color: 'text.secondary',
                        fontSize: '0.95rem'
                      }}
                    >
                      {notApplicable} ({((notApplicable / totalGapItems) * 100).toFixed(1)}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={totalGapItems > 0 ? (notApplicable / totalGapItems) * 100 : 0}
                    color="inherit"
                    sx={{ height: 10, borderRadius: 5 }}
                  />
                </>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'white'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 3,
                fontWeight: 600,
                color: '#1a237e',
                fontSize: '1.1rem'
              }}
            >
              Maturity Assessment Summary
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Box sx={{ mb: 4 }}>
                <Box sx={{ mb: 2.5, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 1.5,
                      fontWeight: 500,
                      color: 'text.primary'
                    }}
                  >
                    <strong>Total Assessments:</strong>{' '}
                    <Box component="span" color="primary.main" fontWeight={700}>
                      {maturityStats.total}
                    </Box>
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      mb: 1.5,
                      fontWeight: 500,
                      color: 'text.primary'
                    }}
                  >
                    <strong>Average Current Maturity:</strong>{' '}
                    <Box component="span" color="primary.main" fontWeight={700} fontSize="1.1rem">
                      {avgCurrentMaturity} / 5.0
                    </Box>
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontWeight: 500,
                      color: 'text.primary'
                    }}
                  >
                    <strong>Average Target Maturity:</strong>{' '}
                    <Box component="span" color="info.main" fontWeight={700} fontSize="1.1rem">
                      {avgTargetMaturity} / 5.0
                    </Box>
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mb: 1.5,
                    fontWeight: 600,
                    color: 'text.primary'
                  }}
                >
                  Overall Maturity Progress
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={maturityProgress}
                  color="primary"
                  sx={{ height: 12, borderRadius: 6 }}
                />
                <Typography 
                  variant="body2" 
                  sx={{ 
                    mt: 1.5, 
                    fontWeight: 500,
                    color: 'text.secondary'
                  }}
                >
                  {maturityProgress.toFixed(1)}% towards target maturity level
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Action Items Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'white'
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 600,
                  color: '#1a237e',
                  fontSize: '1.5rem'
                }}
              >
                Action Items Overview
              </Typography>
              <Button
                variant="outlined"
                href="/action-items"
                sx={{ textTransform: 'none' }}
              >
                View All Action Items
              </Button>
            </Box>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#6366f1', mb: 1 }}>
                    {actionItems?.length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Action Items
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#10b981', mb: 1 }}>
                    {actionItems?.filter(item => item.status === 'Completed').length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Completed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#3b82f6', mb: 1 }}>
                    {actionItems?.filter(item => item.status === 'In Progress').length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    In Progress
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336', mb: 1 }}>
                    {actionItems?.filter(item => {
                      if (!item.due_date || item.status === 'Completed') return false;
                      return new Date(item.due_date) < new Date();
                    }).length || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            {actionItems && actionItems.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#1a237e' }}>
                  Recent Action Items
                </Typography>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell>Assigned To</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {actionItems
                        .sort((a, b) => {
                          if (a.due_date && b.due_date) {
                            return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
                          }
                          return 0;
                        })
                        .slice(0, 5)
                        .map((item) => {
                          const overdue = item.due_date && item.status !== 'Completed' && new Date(item.due_date) < new Date();
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Typography variant="body2" fontWeight={500}>
                                  {item.title}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={item.status}
                                  color={
                                    item.status === 'Completed' ? 'success' :
                                    item.status === 'In Progress' ? 'primary' :
                                    item.status === 'On Hold' ? 'warning' : 'default'
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={item.priority}
                                  color={
                                    item.priority === 'Critical' ? 'error' :
                                    item.priority === 'High' ? 'warning' :
                                    item.priority === 'Medium' ? 'info' : 'default'
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  color={overdue ? 'error' : 'inherit'}
                                  fontWeight={overdue ? 600 : 400}
                                >
                                  {item.due_date
                                    ? new Date(item.due_date).toLocaleDateString()
                                    : '-'}
                                  {overdue && ' ⚠️'}
                                </Typography>
                              </TableCell>
                              <TableCell>{item.assigned_to || '-'}</TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Clause Progress Section */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper 
            elevation={0}
            sx={{ 
              p: 4,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              backgroundColor: 'white'
            }}
          >
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 1,
                fontWeight: 600,
                color: '#1a237e',
                fontSize: '1.5rem'
              }}
            >
              Clause Progress Overview
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 4,
                color: 'text.secondary',
                fontSize: '0.95rem'
              }}
            >
              Click on each clause to view detailed progress for gap assessment and maturity assessment
            </Typography>
            <Box>
              {clauseProgress.map((clause, index) => {
                const gapComplianceColor = clause.gapCompliancePercent >= 80
                  ? 'success'
                  : clause.gapCompliancePercent >= 50
                  ? 'warning'
                  : 'error';
                const maturityColor = clause.maturityProgressPercent >= 80
                  ? 'success'
                  : clause.maturityProgressPercent >= 50
                  ? 'warning'
                  : 'error';

                return (
                  <Accordion 
                    key={index} 
                    elevation={0}
                    sx={{ 
                      mb: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:before': {
                        display: 'none'
                      },
                      '&.Mui-expanded': {
                        margin: '0 0 16px 0'
                      }
                    }}
                  >
                    <AccordionSummary 
                      expandIcon={<ExpandMoreIcon />}
                      sx={{
                        px: 3,
                        py: 2,
                        '&:hover': {
                          backgroundColor: 'grey.50'
                        },
                        '&.Mui-expanded': {
                          borderBottom: '1px solid',
                          borderColor: 'divider'
                        }
                      }}
                    >
                      <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6">{clause.section}</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {clause.standardRefs.length} standard reference{clause.standardRefs.length !== 1 ? 's' : ''}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          {clause.gapStats.total > 0 && (
                            <Box sx={{ minWidth: 150 }}>
                              <Typography variant="caption" color="textSecondary">
                                Gap Compliance
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={clause.gapCompliancePercent}
                                  color={gapComplianceColor}
                                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                                />
                                <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 50 }}>
                                  {clause.gapCompliancePercent.toFixed(0)}%
                                </Typography>
                              </Box>
                            </Box>
                          )}
                          {clause.maturityStats.total > 0 && (
                            <Box sx={{ minWidth: 150 }}>
                              <Typography variant="caption" color="textSecondary">
                                Maturity Progress
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={clause.maturityProgressPercent}
                                  color={maturityColor}
                                  sx={{ flex: 1, height: 8, borderRadius: 4 }}
                                />
                                <Typography variant="body2" fontWeight="bold" sx={{ minWidth: 50 }}>
                                  {clause.maturityProgressPercent.toFixed(0)}%
                                </Typography>
                              </Box>
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={3}>
                        {/* Gap Assessment Details */}
                        {clause.gapStats.total > 0 && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                              Gap Assessment Progress
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Total Items</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {clause.gapStats.total}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Fully Compliant</Typography>
                                <Typography variant="body2" fontWeight="bold" color="success.main">
                                  {clause.gapStats.fullyCompliant} ({((clause.gapStats.fullyCompliant / clause.gapStats.total) * 100).toFixed(1)}%)
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={(clause.gapStats.fullyCompliant / clause.gapStats.total) * 100}
                                color="success"
                                sx={{ height: 8, borderRadius: 4, mb: 2 }}
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Partially Compliant</Typography>
                                <Typography variant="body2" fontWeight="bold" color="warning.main">
                                  {clause.gapStats.partiallyCompliant} ({((clause.gapStats.partiallyCompliant / clause.gapStats.total) * 100).toFixed(1)}%)
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={(clause.gapStats.partiallyCompliant / clause.gapStats.total) * 100}
                                color="warning"
                                sx={{ height: 8, borderRadius: 4, mb: 2 }}
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Not Compliant</Typography>
                                <Typography variant="body2" fontWeight="bold" color="error.main">
                                  {clause.gapStats.notCompliant} ({((clause.gapStats.notCompliant / clause.gapStats.total) * 100).toFixed(1)}%)
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={(clause.gapStats.notCompliant / clause.gapStats.total) * 100}
                                color="error"
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                            </Box>
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Standard References:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {clause.standardRefs.map((ref) => (
                                  <Chip key={ref} label={ref} size="small" variant="outlined" />
                                ))}
                              </Box>
                            </Box>
                          </Grid>
                        )}

                        {/* Maturity Assessment Details */}
                        {clause.maturityStats.total > 0 && (
                          <Grid item xs={12} md={6}>
                            <Typography variant="h6" gutterBottom>
                              Maturity Assessment Progress
                            </Typography>
                            <Box sx={{ mb: 2 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Total Items</Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {clause.maturityStats.total}
                                </Typography>
                              </Box>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Average Current Maturity</Typography>
                                <Typography variant="body2" fontWeight="bold" color="primary.main">
                                  {clause.avgCurrent} / 5.0
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={(parseFloat(clause.avgCurrent) / 5) * 100}
                                color="primary"
                                sx={{ height: 8, borderRadius: 4, mb: 2 }}
                              />
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                <Typography variant="body2">Average Target Maturity</Typography>
                                <Typography variant="body2" fontWeight="bold" color="info.main">
                                  {clause.avgTarget} / 5.0
                                </Typography>
                              </Box>
                              <LinearProgress
                                variant="determinate"
                                value={(parseFloat(clause.avgTarget) / 5) * 100}
                                color="info"
                                sx={{ height: 8, borderRadius: 4, mb: 2 }}
                              />
                              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                                <Typography variant="body2" gutterBottom>
                                  <strong>Gap to Target:</strong>{' '}
                                  {(parseFloat(clause.avgTarget) - parseFloat(clause.avgCurrent)).toFixed(2)} points
                                </Typography>
                                <Typography variant="body2">
                                  <strong>Progress:</strong> {clause.maturityProgressPercent.toFixed(1)}% towards target
                                </Typography>
                              </Box>
                            </Box>
                            <Box sx={{ mt: 2 }}>
                              <Typography variant="subtitle2" gutterBottom>
                                Standard References:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {clause.standardRefs.map((ref) => (
                                  <Chip key={ref} label={ref} size="small" variant="outlined" />
                                ))}
                              </Box>
                            </Box>
                          </Grid>
                        )}

                        {/* Detailed Items Table */}
                        {(clause.gapItems.length > 0 || clause.maturityItems.length > 0) && (
                          <Grid item xs={12}>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                              Assessment Items
                            </Typography>
                            <TableContainer>
                              <Table size="small">
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Standard Ref</TableCell>
                                    <TableCell>Assessment Question</TableCell>
                                    {clause.gapItems.length > 0 && <TableCell>Compliance</TableCell>}
                                    {clause.maturityItems.length > 0 && (
                                      <>
                                        <TableCell>Current Maturity</TableCell>
                                        <TableCell>Target Maturity</TableCell>
                                      </>
                                    )}
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {clause.gapItems.map((item) => (
                                    <TableRow key={`gap-${item.id}`}>
                                      <TableCell>{item.standard_ref}</TableCell>
                                      <TableCell>
                                        {item.assessment_question.length > 80
                                          ? `${item.assessment_question.substring(0, 80)}...`
                                          : item.assessment_question}
                                      </TableCell>
                                      <TableCell>
                                        <Chip
                                          label={item.compliance}
                                          size="small"
                                          color={
                                            item.compliance === 'Fully Compliant'
                                              ? 'success'
                                              : item.compliance === 'Partially Compliant'
                                              ? 'warning'
                                              : item.compliance === 'Not Compliant'
                                              ? 'error'
                                              : 'default'
                                          }
                                        />
                                      </TableCell>
                                      {clause.maturityItems.length === 0 && <TableCell colSpan={2} />}
                                    </TableRow>
                                  ))}
                                  {clause.maturityItems.map((item) => {
                                    const gapItem = clause.gapItems.find((g) => g.standard_ref === item.standard_ref);
                                    if (gapItem) return null; // Already shown above
                                    return (
                                      <TableRow key={`maturity-${item.id}`}>
                                        <TableCell>{item.standard_ref}</TableCell>
                                        <TableCell>
                                          {item.assessment_question.length > 80
                                            ? `${item.assessment_question.substring(0, 80)}...`
                                            : item.assessment_question}
                                        </TableCell>
                                        {clause.gapItems.length > 0 && <TableCell />}
                                        <TableCell>
                                          {item.current_maturity_level || 'Not Set'} ({item.current_maturity_score ?? 'N/A'})
                                        </TableCell>
                                        <TableCell>
                                          {item.target_maturity_level || 'Not Set'} ({item.target_maturity_score ?? 'N/A'})
                                        </TableCell>
                                      </TableRow>
                                    );
                                  })}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          </Grid>
                        )}
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                );
              })}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
