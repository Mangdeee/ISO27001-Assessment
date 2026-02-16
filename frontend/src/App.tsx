import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Tabs,
  Tab,
  Box,
} from '@mui/material';
import GapAssessmentPage from './components/GapAssessmentPage';
import MaturityAssessmentPage from './components/MaturityAssessmentPage';
import ActionItemsPage from './components/ActionItemsPage';
import DocumentGenerator from './components/DocumentGenerator';
import Dashboard from './components/Dashboard';
import ErrorBoundary from './components/ErrorBoundary';

function NavigationTabs() {
  const location = useLocation();
  const [currentTab, setCurrentTab] = useState(0);

  useEffect(() => {
    if (location.pathname === '/') {
      setCurrentTab(0);
    } else if (location.pathname === '/gap-assessment') {
      setCurrentTab(1);
    } else if (location.pathname === '/maturity-assessment') {
      setCurrentTab(2);
    } else if (location.pathname === '/action-items') {
      setCurrentTab(3);
    } else if (location.pathname === '/documents') {
      setCurrentTab(4);
    }
  }, [location]);

  return (
    <Box 
      sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        mb: 4,
        backgroundColor: 'white',
        borderRadius: 2,
        px: 1
      }}
    >
      <Tabs 
        value={currentTab}
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.95rem',
            minHeight: 48,
            '&.Mui-selected': {
              fontWeight: 600,
              color: '#667eea'
            }
          },
          '& .MuiTabs-indicator': {
            backgroundColor: '#667eea',
            height: 3,
            borderRadius: '3px 3px 0 0'
          }
        }}
      >
        <Tab label="Dashboard" component={Link} to="/" />
        <Tab label="Gap Assessment" component={Link} to="/gap-assessment" />
        <Tab label="Maturity Assessment" component={Link} to="/maturity-assessment" />
        <Tab label="Action Items" component={Link} to="/action-items" />
        <Tab label="Documents" component={Link} to="/documents" />
      </Tabs>
    </Box>
  );
}

function App() {
  return (
    <Router>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar 
          position="static" 
          elevation={0}
          sx={{ 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <Toolbar sx={{ py: 1.5 }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                flexGrow: 1,
                fontWeight: 600,
                letterSpacing: '-0.01em'
              }}
            >
              ISO 27001 Assessment Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 1.5, sm: 2, md: 2.5, lg: 3 } }}>
          <NavigationTabs />
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/gap-assessment" element={<GapAssessmentPage />} />
              <Route path="/maturity-assessment" element={<MaturityAssessmentPage />} />
              <Route path="/action-items" element={<ActionItemsPage />} />
              <Route path="/documents" element={<DocumentGenerator />} />
            </Routes>
          </ErrorBoundary>
        </Container>
      </Box>
    </Router>
  );
}

export default App;
