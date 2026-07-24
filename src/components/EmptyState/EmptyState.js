import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";

// Generic centered empty-state block - icon in a soft circle, title,
// subtitle, and an optional action (a Button/element passed in as-is).
function EmptyState({ icon: Icon = InboxOutlinedIcon, title, subtitle, action }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: 320,
        textAlign: "center",
        px: 2,
      }}
    >
      <Box
        sx={{
          width: 96,
          height: 96,
          borderRadius: "50%",
          bgcolor: "action.hover",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <Icon sx={{ fontSize: 52, color: "text.secondary", opacity: 0.6 }} />
      </Box>
      {title && (
        <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600, mb: 1 }}>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 400 }}>
          {subtitle}
        </Typography>
      )}
      {action && <Box sx={{ mt: 2 }}>{action}</Box>}
    </Box>
  );
}

export default EmptyState;
