import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Menu,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import { riskService, gapAssessmentService } from '../services/api';
import { RiskRegister, GapAssessment } from '../types';

const RiskRegisterPage: React.FC = () => {
  const [risks, setRisks] = useState<RiskRegister[]>([]);
  const [gapAssessments, setGapAssessments] = useState<GapAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RiskRegister | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [formData, setFormData] = useState({
    risk_id: '',
    title: '',
    description: '',
    category: '',
    likelihood: 'Medium',
    impact: 'Medium',
    risk_level: 'Medium',
    current_controls: '',
    treatment_plan: '',
    treatment_status: 'Open',
    owner: '',
    target_date: '',
    gap_assessment_id: '',
    annex_a_controls: '',
  });

  const likelihoodOptions = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
  const impactOptions = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
  const riskLevelOptions = ['Very Low', 'Low', 'Medium', 'High', 'Very High', 'Critical'];
  const statusOptions = ['Open', 'In Progress', 'Mitigated', 'Accepted', 'Transferred'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [risksResponse, gapResponse] = await Promise.all([
        riskService.getAll(),
        gapAssessmentService.getAll(),
      ]);
      setRisks(Array.isArray(risksResponse.data) ? risksResponse.data : []);
      setGapAssessments(Array.isArray(gapResponse.data) ? gapResponse.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setRisks([]);
      setGapAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateRiskLevel = (likelihood: string, impact: string): string => {
    const likelihoodMap: Record<string, number> = {
      'Very Low': 1,
      'Low': 2,
      'Medium': 3,
      'High': 4,
      'Very High': 5,
    };
    const impactMap: Record<string, number> = {
      'Very Low': 1,
      'Low': 2,
      'Medium': 3,
      'High': 4,
      'Very High': 5,
    };

    const score = (likelihoodMap[likelihood] || 3) * (impactMap[impact] || 3);
    if (score >= 20) return 'Critical';
    if (score >= 15) return 'Very High';
    if (score >= 10) return 'High';
    if (score >= 6) return 'Medium';
    if (score >= 3) return 'Low';
    return 'Very Low';
  };

  const handleOpen = (risk?: RiskRegister) => {
    if (risk) {
      setEditing(risk);
      setFormData({
        risk_id: risk.risk_id,
        title: risk.title,
        description: risk.description,
        category: risk.category,
        likelihood: risk.likelihood,
        impact: risk.impact,
        risk_level: risk.risk_level,
        current_controls: risk.current_controls,
        treatment_plan: risk.treatment_plan,
        treatment_status: risk.treatment_status,
        owner: risk.owner,
        target_date: risk.target_date || '',
        gap_assessment_id: risk.gap_assessment_id?.toString() || '',
        annex_a_controls: risk.annex_a_controls,
      });
    } else {
      setEditing(null);
      setFormData({
        risk_id: `RISK-${Date.now()}`,
        title: '',
        description: '',
        category: '',
        likelihood: 'Medium',
        impact: 'Medium',
        risk_level: 'Medium',
        current_controls: '',
        treatment_plan: '',
        treatment_status: 'Open',
        owner: '',
        target_date: '',
        gap_assessment_id: '',
        annex_a_controls: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleLikelihoodOrImpactChange = (field: 'likelihood' | 'impact', value: string) => {
    const newFormData = { ...formData, [field]: value };
    const newRiskLevel = calculateRiskLevel(
      field === 'likelihood' ? value : newFormData.likelihood,
      field === 'impact' ? value : newFormData.impact
    );
    setFormData({ ...newFormData, risk_level: newRiskLevel });
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        ...formData,
        gap_assessment_id: formData.gap_assessment_id ? parseInt(formData.gap_assessment_id) : null,
        target_date: formData.target_date || null,
      };
      if (editing) {
        await riskService.update(editing.id, payload);
      } else {
        await riskService.create(payload);
      }
      fetchData();
      handleClose();
    } catch (error) {
      console.error('Error saving risk:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this risk?')) {
      try {
        await riskService.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting risk:', error);
      }
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'error';
      case 'Very High':
        return 'error';
      case 'High':
        return 'warning';
      case 'Medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Mitigated':
        return 'success';
      case 'In Progress':
        return 'primary';
      case 'Accepted':
        return 'default';
      case 'Transferred':
        return 'info';
      default:
        return 'warning';
    }
  };

  const filteredRisks = (Array.isArray(risks) ? risks : []).filter((risk) => {
    if (filterStatus !== 'all' && risk.treatment_status !== filterStatus) return false;
    if (filterLevel !== 'all' && risk.risk_level !== filterLevel) return false;
    return true;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Risk Register</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
          >
            Filters
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Risk
          </Button>
        </Box>
      </Box>

      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Treatment Status</InputLabel>
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              label="Treatment Status"
            >
              <MenuItem value="all">All</MenuItem>
              {statusOptions.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Risk Level</InputLabel>
            <Select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              label="Risk Level"
            >
              <MenuItem value="all">All</MenuItem>
              {riskLevelOptions.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Menu>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Risk ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Likelihood</TableCell>
              <TableCell>Impact</TableCell>
              <TableCell>Risk Level</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Owner</TableCell>
              <TableCell>Target Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRisks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {risks && risks.length === 0
                      ? 'No risks found. Click "Add Risk" to create one.'
                      : 'No risks match the current filters.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredRisks.map((risk) => {
                const overdue = risk.target_date && risk.treatment_status !== 'Mitigated' && new Date(risk.target_date) < new Date();
                return (
                  <TableRow
                    key={risk.id}
                    sx={{
                      backgroundColor: overdue ? 'error.light' : 'inherit',
                      '&:hover': {
                        backgroundColor: overdue ? 'error.light' : 'action.hover',
                      },
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {risk.risk_id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {risk.title}
                      </Typography>
                      {risk.description && (
                        <Typography variant="caption" color="text.secondary">
                          {risk.description.length > 50
                            ? `${risk.description.substring(0, 50)}...`
                            : risk.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{risk.category || '-'}</TableCell>
                    <TableCell>
                      <Chip label={risk.likelihood} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={risk.impact} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={risk.risk_level}
                        color={getRiskLevelColor(risk.risk_level) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={risk.treatment_status}
                        color={getStatusColor(risk.treatment_status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{risk.owner || '-'}</TableCell>
                    <TableCell>
                      {risk.target_date ? (
                        <Typography
                          variant="body2"
                          color={overdue ? 'error' : 'inherit'}
                          fontWeight={overdue ? 600 : 400}
                        >
                          {new Date(risk.target_date).toLocaleDateString()}
                          {overdue && ' ⚠️'}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(risk)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(risk.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editing ? 'Edit Risk' : 'Add Risk'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Risk ID"
                value={formData.risk_id}
                onChange={(e) => setFormData({ ...formData, risk_id: e.target.value })}
                fullWidth
                required
              />
              <TextField
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                fullWidth
              />
            </Box>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Likelihood</InputLabel>
                <Select
                  value={formData.likelihood}
                  onChange={(e) => handleLikelihoodOrImpactChange('likelihood', e.target.value)}
                  label="Likelihood"
                >
                  {likelihoodOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Impact</InputLabel>
                <Select
                  value={formData.impact}
                  onChange={(e) => handleLikelihoodOrImpactChange('impact', e.target.value)}
                  label="Impact"
                >
                  {impactOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Risk Level (Auto-calculated)</InputLabel>
                <Select
                  value={formData.risk_level}
                  onChange={(e) => setFormData({ ...formData, risk_level: e.target.value })}
                  label="Risk Level (Auto-calculated)"
                >
                  {riskLevelOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Current Controls"
              value={formData.current_controls}
              onChange={(e) => setFormData({ ...formData, current_controls: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
            <TextField
              label="Treatment Plan"
              value={formData.treatment_plan}
              onChange={(e) => setFormData({ ...formData, treatment_plan: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Treatment Status</InputLabel>
                <Select
                  value={formData.treatment_status}
                  onChange={(e) => setFormData({ ...formData, treatment_status: e.target.value })}
                  label="Treatment Status"
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Owner"
                value={formData.owner}
                onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
                fullWidth
              />
              <TextField
                label="Target Date"
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <FormControl fullWidth>
              <InputLabel>Link to Gap Assessment</InputLabel>
              <Select
                value={formData.gap_assessment_id}
                onChange={(e) => setFormData({ ...formData, gap_assessment_id: e.target.value })}
                label="Link to Gap Assessment"
              >
                <MenuItem value="">None</MenuItem>
                {Array.isArray(gapAssessments) && gapAssessments.map((assessment) => (
                  <MenuItem key={assessment.id} value={assessment.id.toString()}>
                    {assessment.standard_ref} - {assessment.assessment_question.substring(0, 50)}...
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Annex A Controls"
              value={formData.annex_a_controls}
              onChange={(e) => setFormData({ ...formData, annex_a_controls: e.target.value })}
              fullWidth
              placeholder="e.g., A.5.1, A.8.2"
              helperText="Comma-separated list of Annex A controls"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.title || !formData.risk_id}>
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RiskRegisterPage;
