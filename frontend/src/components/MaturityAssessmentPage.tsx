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
import { maturityAssessmentService } from '../services/api';
import { MaturityAssessment } from '../types';

const MaturityAssessmentPage: React.FC = () => {
  const [assessments, setAssessments] = useState<MaturityAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<MaturityAssessment | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [bulkUpdateOpen, setBulkUpdateOpen] = useState(false);
  const [bulkCurrentLevel, setBulkCurrentLevel] = useState('');
  const [bulkTargetLevel, setBulkTargetLevel] = useState('');
  const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
  const [formData, setFormData] = useState({
    category: '',
    section: '',
    standard_ref: '',
    assessment_question: '',
    current_maturity_level: '',
    current_maturity_score: '',
    current_maturity_comments: '',
    target_maturity_level: '',
    target_maturity_score: '',
    target_maturity_comments: '',
  });

  const maturityLevels = [
    'NA - Not Applicable',
    '0 - No',
    '1 – Yes, but ad hoc',
    '2 – Yes, documented but inconsistent',
    '3 – Yes, Consistent but no metrics',
    '4 – Yes, Consistent with metrics',
    '5 – Yes, Optimized',
  ];

  // Extract numeric score from maturity level string
  const getScoreFromLevel = (level: string): number | null => {
    if (!level || level === 'NA - Not Applicable') return null;
    const match = level.match(/^(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  };

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const response = await maturityAssessmentService.getAll();
      setAssessments(response.data);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (assessment?: MaturityAssessment) => {
    if (assessment) {
      setEditing(assessment);
      setFormData({
        category: assessment.category,
        section: assessment.section,
        standard_ref: assessment.standard_ref,
        assessment_question: assessment.assessment_question,
        current_maturity_level: assessment.current_maturity_level || '',
        current_maturity_score: assessment.current_maturity_score?.toString() || '',
        current_maturity_comments: assessment.current_maturity_comments || '',
        target_maturity_level: assessment.target_maturity_level || '',
        target_maturity_score: assessment.target_maturity_score?.toString() || '',
        target_maturity_comments: assessment.target_maturity_comments || '',
      });
    } else {
      setEditing(null);
      setFormData({
        category: '',
        section: '',
        standard_ref: '',
        assessment_question: '',
        current_maturity_level: '',
        current_maturity_score: '',
        current_maturity_comments: '',
        target_maturity_level: '',
        target_maturity_score: '',
        target_maturity_comments: '',
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
      const payload = {
        ...formData,
        current_maturity_score: formData.current_maturity_score
          ? parseInt(formData.current_maturity_score)
          : null,
        target_maturity_score: formData.target_maturity_score
          ? parseInt(formData.target_maturity_score)
          : null,
      };
      if (editing) {
        await maturityAssessmentService.update(editing.id, payload);
      } else {
        await maturityAssessmentService.create(payload);
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
        await maturityAssessmentService.delete(id);
        fetchAssessments();
      } catch (error) {
        console.error('Error deleting assessment:', error);
      }
    }
  };

  const handleCurrentLevelChange = async (id: number, newLevel: string) => {
    setUpdatingIds(prev => new Set(prev).add(id));
    try {
      const assessment = assessments.find(a => a.id === id);
      if (assessment) {
        const newScore = getScoreFromLevel(newLevel);
        const updated = {
          ...assessment,
          current_maturity_level: newLevel,
          current_maturity_score: newScore,
        };
        await maturityAssessmentService.update(id, updated);
        // Update local state immediately
        setAssessments(prev =>
          prev.map(a => a.id === id ? updated : a)
        );
      }
    } catch (error) {
      console.error('Error updating current maturity level:', error);
      fetchAssessments();
    } finally {
      setUpdatingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleTargetLevelChange = async (id: number, newLevel: string) => {
    setUpdatingIds(prev => new Set(prev).add(id));
    try {
      const assessment = assessments.find(a => a.id === id);
      if (assessment) {
        const newScore = getScoreFromLevel(newLevel);
        const updated = {
          ...assessment,
          target_maturity_level: newLevel,
          target_maturity_score: newScore,
        };
        await maturityAssessmentService.update(id, updated);
        // Update local state immediately
        setAssessments(prev =>
          prev.map(a => a.id === id ? updated : a)
        );
      }
    } catch (error) {
      console.error('Error updating target maturity level:', error);
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
      const updatePromises = Array.from(selectedIds).map(id => {
        const assessment = assessments.find(a => a.id === id);
        if (assessment) {
          const updates: Partial<MaturityAssessment> = { ...assessment };
          
          if (bulkCurrentLevel) {
            updates.current_maturity_level = bulkCurrentLevel;
            updates.current_maturity_score = getScoreFromLevel(bulkCurrentLevel);
          }
          
          if (bulkTargetLevel) {
            updates.target_maturity_level = bulkTargetLevel;
            updates.target_maturity_score = getScoreFromLevel(bulkTargetLevel);
          }

          return maturityAssessmentService.update(id, updates);
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
      setSelectedIds(new Set());
      setBulkUpdateOpen(false);
      setBulkCurrentLevel('');
      setBulkTargetLevel('');
      fetchAssessments();
    } catch (error) {
      console.error('Error bulk updating assessments:', error);
      fetchAssessments();
    } finally {
      setUpdatingIds(new Set());
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
        <Typography variant="h4">Maturity Assessment</Typography>
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
              <TableCell>Current Level</TableCell>
              <TableCell>Current Score</TableCell>
              <TableCell>Target Level</TableCell>
              <TableCell>Target Score</TableCell>
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
                    <FormControl size="small" sx={{ minWidth: 220 }}>
                      <Select
                        value={assessment.current_maturity_level || ''}
                        onChange={(e) => handleCurrentLevelChange(assessment.id, e.target.value)}
                        sx={{ height: 32 }}
                      >
                        {maturityLevels.map((level) => (
                          <MenuItem key={level} value={level}>
                            {level}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </TableCell>
                <TableCell>
                  {assessment.current_maturity_score ?? '-'}
                </TableCell>
                <TableCell>
                  {updatingIds.has(assessment.id) ? (
                    <CircularProgress size={20} />
                  ) : (
                    <FormControl size="small" sx={{ minWidth: 220 }}>
                      <Select
                        value={assessment.target_maturity_level || ''}
                        onChange={(e) => handleTargetLevelChange(assessment.id, e.target.value)}
                        sx={{ height: 32 }}
                      >
                        {maturityLevels.map((level) => (
                          <MenuItem key={level} value={level}>
                            {level}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </TableCell>
                <TableCell>
                  {assessment.target_maturity_score ?? '-'}
                </TableCell>
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
              <InputLabel>Current Maturity Level</InputLabel>
              <Select
                value={formData.current_maturity_level}
                onChange={(e) => {
                  const newLevel = e.target.value;
                  const newScore = getScoreFromLevel(newLevel);
                  setFormData({
                    ...formData,
                    current_maturity_level: newLevel,
                    current_maturity_score: newScore?.toString() || '',
                  });
                }}
                label="Current Maturity Level"
              >
                {maturityLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Current Maturity Score"
              type="number"
              value={formData.current_maturity_score}
              onChange={(e) =>
                setFormData({ ...formData, current_maturity_score: e.target.value })
              }
              fullWidth
              helperText="Auto-updated when level changes"
            />
            <TextField
              label="Current Maturity Comments"
              value={formData.current_maturity_comments}
              onChange={(e) =>
                setFormData({ ...formData, current_maturity_comments: e.target.value })
              }
              fullWidth
              multiline
              rows={2}
            />
            <FormControl fullWidth>
              <InputLabel>Target Maturity Level</InputLabel>
              <Select
                value={formData.target_maturity_level}
                onChange={(e) => {
                  const newLevel = e.target.value;
                  const newScore = getScoreFromLevel(newLevel);
                  setFormData({
                    ...formData,
                    target_maturity_level: newLevel,
                    target_maturity_score: newScore?.toString() || '',
                  });
                }}
                label="Target Maturity Level"
              >
                {maturityLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Target Maturity Score"
              type="number"
              value={formData.target_maturity_score}
              onChange={(e) =>
                setFormData({ ...formData, target_maturity_score: e.target.value })
              }
              fullWidth
              helperText="Auto-updated when level changes"
            />
            <TextField
              label="Target Maturity Comments"
              value={formData.target_maturity_comments}
              onChange={(e) =>
                setFormData({ ...formData, target_maturity_comments: e.target.value })
              }
              fullWidth
              multiline
              rows={2}
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

      <Dialog open={bulkUpdateOpen} onClose={() => setBulkUpdateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Update Maturity Levels</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Update {selectedIds.size} selected assessment{selectedIds.size !== 1 ? 's' : ''}:
            </Typography>
            <FormControl fullWidth>
              <InputLabel>Current Maturity Level</InputLabel>
              <Select
                value={bulkCurrentLevel}
                onChange={(e) => setBulkCurrentLevel(e.target.value)}
                label="Current Maturity Level"
              >
                <MenuItem value="">Keep current</MenuItem>
                {maturityLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level} {getScoreFromLevel(level) !== null ? `(Score: ${getScoreFromLevel(level)})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Target Maturity Level</InputLabel>
              <Select
                value={bulkTargetLevel}
                onChange={(e) => setBulkTargetLevel(e.target.value)}
                label="Target Maturity Level"
              >
                <MenuItem value="">Keep current</MenuItem>
                {maturityLevels.map((level) => (
                  <MenuItem key={level} value={level}>
                    {level} {getScoreFromLevel(level) !== null ? `(Score: ${getScoreFromLevel(level)})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="caption" color="text.secondary">
              Note: Scores will be automatically updated based on the selected levels.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setBulkUpdateOpen(false);
            setBulkCurrentLevel('');
            setBulkTargetLevel('');
          }}>Cancel</Button>
          <Button 
            onClick={handleBulkUpdate} 
            variant="contained" 
            disabled={updatingIds.size > 0 || (!bulkCurrentLevel && !bulkTargetLevel)}
          >
            {updatingIds.size > 0 ? 'Updating...' : 'Update All'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MaturityAssessmentPage;
