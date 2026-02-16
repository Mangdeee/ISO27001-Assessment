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
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Chip,
  Menu,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { evidenceService, gapAssessmentService } from '../services/api';
import { Evidence, GapAssessment } from '../types';

const EvidencePage: React.FC = () => {
  const [evidence, setEvidence] = useState<Evidence[]>([]);
  const [gapAssessments, setGapAssessments] = useState<GapAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Evidence | null>(null);
  const [filterClause, setFilterClause] = useState<string>('all');
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    file_name: '',
    file_path: '',
    file_size: '',
    file_type: '',
    gap_assessment_id: '',
    clause_reference: '',
    annex_reference: '',
    uploaded_by: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [evidenceResponse, gapResponse] = await Promise.all([
        evidenceService.getAll(),
        gapAssessmentService.getAll(),
      ]);
      setEvidence(Array.isArray(evidenceResponse.data) ? evidenceResponse.data : []);
      setGapAssessments(Array.isArray(gapResponse.data) ? gapResponse.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setEvidence([]);
      setGapAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (item?: Evidence) => {
    if (item) {
      setEditing(item);
      setFormData({
        title: item.title,
        description: item.description,
        file_name: item.file_name,
        file_path: item.file_path,
        file_size: item.file_size?.toString() || '',
        file_type: item.file_type,
        gap_assessment_id: item.gap_assessment_id?.toString() || '',
        clause_reference: item.clause_reference,
        annex_reference: item.annex_reference,
        uploaded_by: item.uploaded_by,
      });
    } else {
      setEditing(null);
      setFormData({
        title: '',
        description: '',
        file_name: '',
        file_path: '',
        file_size: '',
        file_type: '',
        gap_assessment_id: '',
        clause_reference: '',
        annex_reference: '',
        uploaded_by: '',
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
        gap_assessment_id: formData.gap_assessment_id ? parseInt(formData.gap_assessment_id) : null,
        file_size: formData.file_size ? parseInt(formData.file_size) : null,
      };
      if (editing) {
        await evidenceService.update(editing.id, payload);
      } else {
        await evidenceService.create(payload);
      }
      fetchData();
      handleClose();
    } catch (error) {
      console.error('Error saving evidence:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this evidence?')) {
      try {
        await evidenceService.delete(id);
        fetchData();
      } catch (error) {
        console.error('Error deleting evidence:', error);
      }
    }
  };

  const formatFileSize = (bytes: number | null | undefined) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const filteredEvidence = (Array.isArray(evidence) ? evidence : []).filter((item) => {
    if (filterClause !== 'all' && item.clause_reference !== filterClause) return false;
    return true;
  });

  const uniqueClauses = Array.from(new Set(evidence.map(e => e.clause_reference).filter(Boolean)));

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
        <Typography variant="h4">Evidence & Documents</Typography>
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
            Add Evidence
          </Button>
        </Box>
      </Box>

      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <Box sx={{ p: 2, minWidth: 200 }}>
          <FormControl fullWidth>
            <InputLabel>Clause Reference</InputLabel>
            <Select
              value={filterClause}
              onChange={(e) => setFilterClause(e.target.value)}
              label="Clause Reference"
            >
              <MenuItem value="all">All</MenuItem>
              {uniqueClauses.map((clause) => (
                <MenuItem key={clause} value={clause}>
                  {clause}
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
              <TableCell>Title</TableCell>
              <TableCell>File</TableCell>
              <TableCell>Clause Reference</TableCell>
              <TableCell>Annex Reference</TableCell>
              <TableCell>Linked Assessment</TableCell>
              <TableCell>Uploaded By</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredEvidence.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {evidence && evidence.length === 0
                      ? 'No evidence found. Click "Add Evidence" to upload documents.'
                      : 'No evidence matches the current filters.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredEvidence.map((item) => {
                const linkedAssessment = item.gap_assessment_id && Array.isArray(gapAssessments)
                  ? gapAssessments.find((a) => a.id === item.gap_assessment_id)
                  : null;

                return (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {item.title}
                      </Typography>
                      {item.description && (
                        <Typography variant="caption" color="text.secondary">
                          {item.description.length > 50
                            ? `${item.description.substring(0, 50)}...`
                            : item.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AttachFileIcon fontSize="small" color="action" />
                        <Box>
                          <Typography variant="body2">{item.file_name || '-'}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(item.file_size)} • {item.file_type || '-'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {item.clause_reference ? (
                        <Chip label={item.clause_reference} size="small" variant="outlined" />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {item.annex_reference ? (
                        <Chip label={item.annex_reference} size="small" variant="outlined" color="primary" />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {linkedAssessment ? (
                        <Typography variant="body2" color="primary">
                          {linkedAssessment.standard_ref}
                        </Typography>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{item.uploaded_by || '-'}</TableCell>
                    <TableCell>
                      {item.uploaded_at
                        ? new Date(item.uploaded_at).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleOpen(item)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(item.id)}
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
          {editing ? 'Edit Evidence' : 'Add Evidence'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
              <TextField
                label="File Name"
                value={formData.file_name}
                onChange={(e) => setFormData({ ...formData, file_name: e.target.value })}
                fullWidth
              />
              <TextField
                label="File Type"
                value={formData.file_type}
                onChange={(e) => setFormData({ ...formData, file_type: e.target.value })}
                fullWidth
                placeholder="e.g., PDF, DOCX"
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="File Path"
                value={formData.file_path}
                onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
                fullWidth
                placeholder="/uploads/evidence/..."
              />
              <TextField
                label="File Size (bytes)"
                type="number"
                value={formData.file_size}
                onChange={(e) => setFormData({ ...formData, file_size: e.target.value })}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Clause Reference"
                value={formData.clause_reference}
                onChange={(e) => setFormData({ ...formData, clause_reference: e.target.value })}
                fullWidth
                placeholder="e.g., Clause 4.1"
              />
              <TextField
                label="Annex Reference"
                value={formData.annex_reference}
                onChange={(e) => setFormData({ ...formData, annex_reference: e.target.value })}
                fullWidth
                placeholder="e.g., A.5.1"
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
              label="Uploaded By"
              value={formData.uploaded_by}
              onChange={(e) => setFormData({ ...formData, uploaded_by: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.title}>
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EvidencePage;
