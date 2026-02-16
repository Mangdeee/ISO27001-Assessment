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
  Checkbox,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { gapAssessmentService } from '../services/api';
import { GapAssessment } from '../types';

const GapAssessmentPage: React.FC = () => {
  const [assessments, setAssessments] = useState<GapAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<GapAssessment | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false);
  const [bulkCompliance, setBulkCompliance] = useState('Fully Compliant');
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    category: '',
    section: '',
    standard_ref: '',
    assessment_question: '',
    compliance: 'Not Compliant',
    notes: '',
    target_date: '',
  });

  const complianceOptions = [
    'Fully Compliant',
    'Partially Compliant',
    'Not Compliant',
    'Not Applicable',
  ];

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await gapAssessmentService.getAll();
      setAssessments(response.data);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (assessment?: GapAssessment) => {
    if (assessment) {
      setEditing(assessment);
      setFormData({
        category: assessment.category,
        section: assessment.section,
        standard_ref: assessment.standard_ref,
        assessment_question: assessment.assessment_question,
        compliance: assessment.compliance,
        notes: assessment.notes,
        target_date: assessment.target_date || '',
      });
    } else {
      setEditing(null);
      setFormData({
        category: '',
        section: '',
        standard_ref: '',
        assessment_question: '',
        compliance: 'Not Compliant',
        notes: '',
        target_date: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditing(null);
  };

  const handleSubmit = async () => {
    try {
      if (editing) {
        await gapAssessmentService.update(editing.id, formData);
      } else {
        await gapAssessmentService.create(formData);
      }
      fetchAssessments();
      handleClose();
    } catch (error) {
      console.error('Error saving assessment:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this assessment?')) {
      try {
        await gapAssessmentService.delete(id);
        fetchAssessments();
      } catch (error) {
        console.error('Error deleting assessment:', error);
      }
    }
  };

  const handleComplianceChange = async (id: number, newCompliance: string) => {
    setUpdatingIds(prev => new Set(prev).add(id));
    try {
      const assessment = assessments.find(a => a.id === id);
      if (assessment) {
        await gapAssessmentService.update(id, {
          ...assessment,
          compliance: newCompliance,
        });
        // Update local state immediately for better UX
        setAssessments(prev =>
          prev.map(a => a.id === id ? { ...a, compliance: newCompliance } : a)
        );
      }
    } catch (error) {
      console.error('Error updating compliance:', error);
      // Revert on error
      fetchAssessments();
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedIds(new Set(assessments.map(a => a.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkUpdate = async () => {
    if (selectedIds.size === 0) return;

    setUpdatingIds(selectedIds);
    try {
      // Update all selected assessments
      const updatePromises = Array.from(selectedIds).map(id => {
        const assessment = assessments.find(a => a.id === id);
        if (assessment) {
          return gapAssessmentService.update(id, {
            ...assessment,
            compliance: bulkCompliance,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      setSelectedIds(new Set());
      setBulkUpdateOpen(false);
      fetchAssessments();
    } catch (error) {
      console.error('Error bulk updating assessments:', error);
      fetchAssessments();
    } finally {
      setUpdatingIds(new Set());
    }
  };

  const getComplianceColor = (compliance: string) => {
    switch (compliance) {
      case 'Fully Compliant':
        return 'success';
      case 'Partially Compliant':
        return 'warning';
      case 'Not Compliant':
        return 'error';
      case 'Not Applicable':
        return 'default';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const isAllSelected = assessments.length > 0 && selectedIds.size === assessments.length;
  const isIndeterminate = selectedIds.size > 0 && selectedIds.size < assessments.length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Gap Assessment</Typography>
        <Box display="flex" gap={2}>
          {selectedIds.size > 0 && (
            <Button
              variant="outlined"
              color="primary"
              onClick={() => setBulkUpdateOpen(true)}
            >
              Bulk Update ({selectedIds.size})
            </Button>
          )}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Add Assessment
          </Button>
        </Box>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={isIndeterminate}
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Section</TableCell>
              <TableCell>Standard Ref</TableCell>
              <TableCell>Assessment Question</TableCell>
              <TableCell>Compliance</TableCell>
              <TableCell>Target Date</TableCell>
              <TableCell>Notes</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assessments.map((assessment) => (
              <TableRow key={assessment.id} selected={selectedIds.has(assessment.id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedIds.has(assessment.id)}
                    onChange={() => handleSelectOne(assessment.id)}
                  />
                </TableCell>
                <TableCell>{assessment.category}</TableCell>
                <TableCell>{assessment.section}</TableCell>
                <TableCell>{assessment.standard_ref}</TableCell>
                <TableCell>{assessment.assessment_question}</TableCell>
                <TableCell>
                  {updatingIds.has(assessment.id) ? (
                    <CircularProgress size={20} />
                  ) : (
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <Select
                        value={assessment.compliance}
                        onChange={(e) => handleComplianceChange(assessment.id, e.target.value)}
                        sx={{ height: 32 }}
                      >
                        {complianceOptions.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </TableCell>
                <TableCell>
                  {assessment.target_date
                    ? new Date(assessment.target_date).toLocaleDateString()
                    : '-'}
                </TableCell>
                <TableCell>{assessment.notes || '-'}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(assessment)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(assessment.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editing ? 'Edit Assessment' : 'Add Assessment'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              fullWidth
            />
            <TextField
              label="Section"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              fullWidth
            />
            <TextField
              label="Standard Ref"
              value={formData.standard_ref}
              onChange={(e) => setFormData({ ...formData, standard_ref: e.target.value })}
              fullWidth
            />
            <TextField
              label="Assessment Question"
              value={formData.assessment_question}
              onChange={(e) =>
                setFormData({ ...formData, assessment_question: e.target.value })
              }
              fullWidth
              multiline
              rows={3}
            />
            <FormControl fullWidth>
              <InputLabel>Compliance</InputLabel>
              <Select
                value={formData.compliance}
                onChange={(e) =>
                  setFormData({ ...formData, compliance: e.target.value })
                }
                label="Compliance"
              >
                {complianceOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Target Date"
              type="date"
              value={formData.target_date}
              onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={bulkUpdateOpen} onClose={() => setBulkUpdateOpen(false)}>
        <DialogTitle>Bulk Update Compliance</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1, minWidth: 300 }}>
            <Typography variant="body2" color="text.secondary">
              Update {selectedIds.size} selected assessment{selectedIds.size !== 1 ? 's' : ''} to:
            </Typography>
            <FormControl fullWidth>
              <InputLabel>New Compliance Status</InputLabel>
              <Select
                value={bulkCompliance}
                onChange={(e) => setBulkCompliance(e.target.value)}
                label="New Compliance Status"
              >
                {complianceOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkUpdateOpen(false)}>Cancel</Button>
          <Button onClick={handleBulkUpdate} variant="contained" disabled={updatingIds.size > 0}>
            {updatingIds.size > 0 ? 'Updating...' : 'Update All'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GapAssessmentPage;
