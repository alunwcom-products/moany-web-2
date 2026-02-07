import { styled, keyframes } from '@mui/material/styles';
import { Box } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function DashboardRefreshIcon({ warn }) {

  const pulse = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  `;

  const AnimationWrapper = styled(Box, {  
    shouldForwardProp: (prop) => prop !== 'warn',
  })(({ warn }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: warn ? `${pulse} 1s ease-in-out infinite` : 'none',
    color: warn ? '#fbdb68' : 'inherit',
  }));

  return (
    <AnimationWrapper warn={warn}>
      <RefreshIcon/>
    </AnimationWrapper>
  );
};


