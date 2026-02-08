/**
 * Tests for parsing HTTP 300 Multiple Choices disambiguation responses
 */

import { test } from "node:test";
import assert from "node:assert";
import { parseDisambiguationHtml } from "../../api/legislation-client.js";

// Real response body from https://www.legislation.gov.uk/ukpga/1914/1/data.xml
const DISAMBIGUATION_HTML = `<div id="content"><p class="first">2 items found</p><p>The link that you've followed could mean either of the following:</p><ul><li><a href="/ukpga/Geo5/4-5/1">Consolidated Fund (No. 1) Act 1914</a></li><li><a href="/ukpga/Geo5/5-6/1">Anglo-Portuguese Commercial Treaty Act 1914</a></li></ul></div>`;

test("parseDisambiguationHtml extracts alternatives from 300 response", () => {
  const result = parseDisambiguationHtml(DISAMBIGUATION_HTML);

  assert.strictEqual(result.length, 2);

  assert.deepStrictEqual(result[0], {
    id: "ukpga/Geo5/4-5/1",
    title: "Consolidated Fund (No. 1) Act 1914",
    type: "ukpga",
    year: "Geo5/4-5",
    number: "1",
  });

  assert.deepStrictEqual(result[1], {
    id: "ukpga/Geo5/5-6/1",
    title: "Anglo-Portuguese Commercial Treaty Act 1914",
    type: "ukpga",
    year: "Geo5/5-6",
    number: "1",
  });
});

test("parseDisambiguationHtml returns empty array for non-matching HTML", () => {
  const result = parseDisambiguationHtml("<html><body>No links here</body></html>");
  assert.deepStrictEqual(result, []);
});

test("parseDisambiguationHtml handles single alternative", () => {
  const html = `<ul><li><a href="/asp/Edw7/10/5">Some Old Act</a></li></ul>`;
  const result = parseDisambiguationHtml(html);

  assert.strictEqual(result.length, 1);
  assert.deepStrictEqual(result[0], {
    id: "asp/Edw7/10/5",
    title: "Some Old Act",
    type: "asp",
    year: "Edw7/10",
    number: "5",
  });
});
