import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Avatar from "./Avatar";

// Overlapping row of avatars with a "+N" overflow badge - used for "who
// reacted" / "who replied" summaries.
function AvatarStack({ people, max = 3, size = "sm" }) {
  const visible = people.slice(0, max);
  const overflow = people.length - visible.length;
  const overlap = (size === "lg" ? 40 : size === "md" ? 32 : 24) * 0.6;

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      {visible.map((person, index) => (
        <Tooltip key={person.id} title={person.name}>
          <Box
            sx={{
              ml: index === 0 ? 0 : `-${overlap / 2}px`,
              border: "2px solid",
              borderColor: "background.paper",
              borderRadius: "50%",
              zIndex: visible.length - index,
            }}
          >
            <Avatar name={person.name} src={person.avatarUrl} size={size} />
          </Box>
        </Tooltip>
      ))}
      {overflow > 0 && (
        <Box
          sx={{
            ml: `-${overlap / 2}px`,
            width: size === "lg" ? 40 : size === "md" ? 32 : 24,
            height: size === "lg" ? 40 : size === "md" ? 32 : 24,
            borderRadius: "50%",
            border: "2px solid",
            borderColor: "background.paper",
            bgcolor: "action.selected",
            color: "text.secondary",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          +{overflow}
        </Box>
      )}
    </Box>
  );
}

export default AvatarStack;
