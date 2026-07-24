import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";

// Full-viewport "this micro-frontend only works inside the host" screen -
// shown when an MFE is opened directly at its own dev/standalone URL instead
// of through the main app. Originally file-management-mf's local
// StandaloneFallback; centralized here so every MFE shows the identical
// page (icon, copy, spacing) via one implementation instead of each
// maintaining its own copy.
function StandaloneUnavailable({ moduleName }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2,
      }}
    >
      <Stack spacing={2} alignItems="center" maxWidth={420} textAlign="center">
        <ErrorOutlinedIcon sx={{ fontSize: 72, color: "warning.main" }} />

        <Typography variant="h3" fontWeight={700}>
          404
        </Typography>

        <Typography variant="h6">Page Not Available !!</Typography>

        <Typography color="text.secondary">
          {`The page you're trying to open isn't available here. ${moduleName} features can only be accessed from within the main application. Please go back to continue.`}
        </Typography>
      </Stack>
    </Box>
  );
}

export default StandaloneUnavailable;
