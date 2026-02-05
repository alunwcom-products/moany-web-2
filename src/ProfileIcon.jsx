import { styled, keyframes } from '@mui/material/styles';
import { Box } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';

export default function ProfileIcon({ warn }) {

  const colorShift = keyframes`
    0% { color: #ffffff; }
    100% { color: #ff9933; }
  `;

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
    animation: warn ? `${pulse} 2s ease-in-out infinite, ${colorShift} 1s infinite alternate` : 'none',
    color: warn ? '#ff9933' : 'inherit',
  }));

  return (
    <AnimationWrapper warn={warn}>
      <AccountCircle/>
    </AnimationWrapper>
  );
};


