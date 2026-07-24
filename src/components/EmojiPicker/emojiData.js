// Small curated, static emoji set grouped by category - deliberately not
// pulling in an emoji-data npm dependency for a picker this scoped. Each
// entry keeps a `name` alongside `char` purely so search has something to
// match against.
export const EMOJI_CATEGORIES = [
  {
    category: "Smileys",
    emojis: [
      { char: "😀", name: "grinning" },
      { char: "😁", name: "smile" },
      { char: "😂", name: "joy" },
      { char: "🤣", name: "rofl" },
      { char: "😊", name: "blush" },
      { char: "😍", name: "heart eyes" },
      { char: "😎", name: "cool" },
      { char: "🤔", name: "thinking" },
      { char: "😢", name: "cry" },
      { char: "😮", name: "surprised" },
    ],
  },
  {
    category: "Gestures",
    emojis: [
      { char: "👍", name: "thumbs up" },
      { char: "👎", name: "thumbs down" },
      { char: "👌", name: "ok" },
      { char: "✌️", name: "peace" },
      { char: "🤝", name: "handshake" },
      { char: "🙏", name: "pray thanks" },
      { char: "💪", name: "strong" },
      { char: "👋", name: "wave" },
      { char: "👏", name: "clap" },
    ],
  },
  {
    category: "Hearts",
    emojis: [
      { char: "❤️", name: "heart" },
      { char: "🧡", name: "orange heart" },
      { char: "💛", name: "yellow heart" },
      { char: "💚", name: "green heart" },
      { char: "💙", name: "blue heart" },
      { char: "💜", name: "purple heart" },
      { char: "🖤", name: "black heart" },
    ],
  },
  {
    category: "Objects",
    emojis: [
      { char: "🎉", name: "party celebrate" },
      { char: "🔥", name: "fire" },
      { char: "✅", name: "check done" },
      { char: "⭐", name: "star" },
      { char: "📌", name: "pin" },
      { char: "📎", name: "attachment" },
      { char: "💡", name: "idea" },
      { char: "🚀", name: "rocket launch" },
      { char: "💯", name: "hundred" },
    ],
  },
];
