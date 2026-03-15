#!/usr/bin/env bash
# Seed the gallery with SEO-targeted lesson plans.
# Each plan = indexed page with affiliate links.

BASE="https://artspark-alpha.vercel.app"
APP_KEY="artspark-2026-secret"

PLANS=(
  "Easy watercolor painting for kids — simple watercolor techniques using wet-on-wet method, perfect for beginners ages 4-8"
  "Paper plate animal craft — turn paper plates into fun animal faces using paint, googly eyes, and construction paper"
  "Nature collage with leaves and flowers — collect natural materials from outdoors and arrange them into beautiful collages"
  "Salt dough ornaments for kids — make, bake, and paint simple salt dough shapes, great for holiday gifts"
  "Bubble wrap printing — use bubble wrap as a stamp to create colorful textured prints on paper"
  "Tissue paper stained glass craft — layer colored tissue paper on contact paper to create sun catchers"
  "Handprint art for toddlers and preschoolers — use handprints to create animals, flowers, and seasonal art"
  "Easy clay pinch pot for kids — make a simple pinch pot from air-dry clay, then paint and decorate"
  "Sponge painting for preschool — cut sponges into shapes and stamp colorful patterns"
  "Recycled materials robot sculpture — build fun robots from cardboard boxes, bottle caps, and foil"
)

for desc in "${PLANS[@]}"; do
  echo "=== Generating: ${desc%%—*} ==="

  # Generate the plan
  RESULT=$(curl -s -X POST "$BASE/api/generate-text" \
    -H "Content-Type: application/json" \
    -H "x-app-key: $APP_KEY" \
    -d "{\"description\": \"$desc\"}" \
    --max-time 90)

  if echo "$RESULT" | python3 -c "import sys,json; json.load(sys.stdin)['plan']" 2>/dev/null; then
    # Extract plan data and save
    PLAN_JSON=$(echo "$RESULT" | python3 -c "
import sys, json, uuid
data = json.load(sys.stdin)
plan = data['plan']
save = {
    'id': str(uuid.uuid4()),
    'title': plan['title'],
    'overview': plan.get('overview', ''),
    'plan_json': json.dumps(plan),
    'source_url': '',
    'mess_level': plan.get('mess_level', 'medium'),
    'tags': ', '.join(plan.get('tags', []) + plan.get('season_tags', []))
}
print(json.dumps(save))
")

    SAVE_RESULT=$(curl -s -X POST "$BASE/api/plans" \
      -H "Content-Type: application/json" \
      -d "$PLAN_JSON")

    TITLE=$(echo "$PLAN_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin)['title'])")
    echo "  Saved: $TITLE"
  else
    echo "  FAILED: $(echo "$RESULT" | head -c 200)"
  fi

  echo ""
done

echo "=== Done! ==="
