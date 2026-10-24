/**
 * <kids-stories> — the Daily Grace Kids row of story covers.
 *
 * The same looping, swipeable row as <story-carousel>, filled with the
 * children's retellings: assets/kids-stories.json lists them, and the folded
 * corner of each cover opens it in the story reader as
 * apps/pages/stories.html?set=kids&story=<id>, which reads
 * assets/kids/stories/<id>.json. It remembers its own current story, apart
 * from the home page's row.
 *
 * Usage
 *   <kids-stories></kids-stories>
 *   <script type="module" src="../components/kids-stories.js"></script>
 *
 * Attributes, methods, events and CSS custom properties are those of
 * <story-carousel> (story-carousel.js); only the defaults differ. They are
 * resolved against this file, so the element works from any page.
 *   src       Default: assets/kids-stories.json
 *   reader    Default: apps/pages/stories.html?set=kids
 *   heading   Default: Kids Stories
 */

// Same ?v= token as the home page's import, so a page never loads two copies.
import { StoryCarousel } from "./story-carousel.js?v=20261024-1";

const asset = (path) => new URL(path, import.meta.url).href;

export class KidsStories extends StoryCarousel {
    static defaults = {
        src: asset("../../assets/kids-stories.json"),
        reader: asset("../pages/stories.html?set=kids"),
        heading: "Kids Stories",
        storageKey: "dailygrace:kids-stories",
    };
}

if (!customElements.get("kids-stories")) {
    customElements.define("kids-stories", KidsStories);
}
