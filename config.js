// ============================================
// GALLERY CONFIG
//
// Control which photos appear as the hero
// and card cover images on the homepage.
//
// HOW TO FIND A PUBLIC ID:
// In Cloudinary Media Library, click any photo
// → the public_id is shown in the right panel.
// It looks like: "Malaysia_2025/Malaysia_2025_14"
//
// Leave any value as '' to use the first photo
// in that folder automatically.
// ============================================

module.exports = {
  // The large background image at the top of the homepage
  hero: "Taiwan_2025/Taiwan_2025_40",

  // The cover photo shown on each country card
  // Key = folder name, Value = public_id of your chosen photo
  covers: {
    Malaysia_2025: "Malaysia_2025/Malaysia_2025_14",
    Taiwan_2025: "Taiwan_2025/Taiwan_2025_47",
    Vietnam_2025: "Vietnam_2025/Vietnam_2025_1",
  },
};
