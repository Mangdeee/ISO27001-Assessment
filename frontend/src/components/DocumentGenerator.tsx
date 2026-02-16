import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import { gapAssessmentService } from '../services/api';
import { GapAssessment } from '../types';

const compareClauseRefs = (a: string, b: string) => {
  const pa = a.split('.').map(x => parseInt(x, 10));
  const pb = b.split('.').map(x => parseInt(x, 10));
  const max = Math.max(pa.length, pb.length);
  for (let i = 0; i < max; i++) {
    const na = Number.isFinite(pa[i]) ? pa[i] : -1;
    const nb = Number.isFinite(pb[i]) ? pb[i] : -1;
    if (na !== nb) return na - nb;
  }
  return a.localeCompare(b);
};

const DocumentGenerator: React.FC = () => {
  const [selectedClause, setSelectedClause] = useState('');
  const [availableClauses, setAvailableClauses] = useState<string[]>([]);
  const [gapAssessments, setGapAssessments] = useState<GapAssessment[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClauses, setLoadingClauses] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const [clausesResponse, gapResponse] = await Promise.all([
        fetch(`${API_URL}/templates/clauses`),
        gapAssessmentService.getAll(),
      ]);

      if (clausesResponse.ok) {
        const clausesData = await clausesResponse.json();
        const clauses = Array.isArray(clausesData.clauses) ? clausesData.clauses : [];
        setAvailableClauses(clauses.slice().sort(compareClauseRefs));
      }

      setGapAssessments(Array.isArray(gapResponse.data) ? gapResponse.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingClauses(false);
    }
  };

  const handleGenerateClause = async (clause: string) => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await fetch(`${API_URL}/generate/clause/${clause}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ISO27001-Clause-${clause}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error generating document');
      }
    } catch (error) {
      console.error('Error generating document:', error);
      alert('Error generating document');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSoA = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await fetch(`${API_URL}/generate/soa`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ISO27001-Statement-of-Applicability-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error generating SoA');
      }
    } catch (error) {
      console.error('Error generating SoA:', error);
      alert('Error generating SoA');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateNotionExport = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
      const response = await fetch(`${API_URL}/generate/notion-export`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ISO27001-Notion-Export-${new Date().toISOString().split('T')[0]}.md`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Error generating export');
      }
    } catch (error) {
      console.error('Error generating export:', error);
      alert('Error generating export');
    } finally {
      setLoading(false);
    }
  };

  // Get unique clauses from gap assessments
  const uniqueClauses = Array.from(
    new Set(gapAssessments.map(a => {
      // Extract clause number from standard_ref
      // Support nested clause refs like 6.1.3 (not just 6.1)
      const match = a.standard_ref.match(/(\d+(?:\.\d+)+)/);
      return match ? match[1] : a.standard_ref;
    }))
  ).sort(compareClauseRefs);

  if (loadingClauses) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Document Generator</Typography>
        <Typography variant="body2" color="text.secondary">
          Generate ISO 27001 documents for Notion
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        Generate formatted Markdown documents that can be directly imported into Notion. All documents are pre-formatted with ISO 27001 clause structures.
      </Alert>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<DescriptionIcon />}
                  onClick={handleGenerateSoA}
                  disabled={loading}
                  fullWidth
                >
                  Generate Statement of Applicability (SoA)
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleGenerateNotionExport}
                  disabled={loading}
                  fullWidth
                >
                  Export All to Notion Format
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Clause Templates */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generate Clause Documents
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select a clause to generate a formatted document template
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Clause</InputLabel>
                <Select
                  value={selectedClause}
                  onChange={(e) => setSelectedClause(e.target.value)}
                  label="Select Clause"
                >
                  <MenuItem value="">-- Select a clause --</MenuItem>
                  {availableClauses.map((clause) => (
                    <MenuItem key={clause} value={clause}>
                      Clause {clause}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedClause && (
                <Button
                  variant="contained"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleGenerateClause(selectedClause)}
                  disabled={loading}
                  fullWidth
                >
                  Generate Clause {selectedClause} Document
                </Button>
              )}

              <Divider sx={{ my: 3 }} />

              <Typography variant="subtitle1" gutterBottom>
                Available Clauses from Your Assessments
              </Typography>
              <Paper variant="outlined" sx={{ maxHeight: 300, overflow: 'auto' }}>
                <List dense>
                  {uniqueClauses.map((clause, index) => (
                    <React.Fragment key={clause}>
                      <ListItem>
                        <ListItemButton onClick={() => handleGenerateClause(clause)}>
                          <ListItemText
                            primary={`Clause ${clause}`}
                            secondary={`Click to generate document`}
                          />
                          <DownloadIcon fontSize="small" color="action" />
                        </ListItemButton>
                      </ListItem>
                      {index < uniqueClauses.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" mt={3}>
          <CircularProgress />
          <Typography variant="body2" sx={{ ml: 2 }}>
            Generating document...
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default DocumentGenerator;
