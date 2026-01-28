/**
 * Tests for MetadataParser
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { MetadataParser } from '../../parsers/metadata-parser.js';

const SAMPLE_METADATA_XML = `
<Legislation xmlns="http://www.legislation.gov.uk/namespaces/legislation"
    DocumentURI="http://www.legislation.gov.uk/ukpga/2020/2"
    RestrictExtent="E+W+S+N.I." RestrictStartDate="2024-01-01">
    <ukm:Metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dct="http://purl.org/dc/terms/"
        xmlns:ukm="http://www.legislation.gov.uk/namespaces/metadata">
        <dc:identifier>http://www.legislation.gov.uk/ukpga/2020/2</dc:identifier>
        <dc:title>Direct Payments to Farmers (Legislative Continuity) Act 2020</dc:title>
        <dc:description>An Act to make provision for the incorporation of the Direct Payments
            Regulation into domestic law; for enabling an increase in the total maximum amount of
            direct payments under that Regulation; and for connected purposes.</dc:description>
        <dc:language>en</dc:language>
        <dc:publisher>Statute Law Database</dc:publisher>
        <dc:modified>2024-03-02</dc:modified>
        <dc:contributor>Expert Participation</dc:contributor>
        <dct:valid>2024-01-01</dct:valid>
        <ukm:PrimaryMetadata>
            <ukm:DocumentClassification>
                <ukm:DocumentCategory Value="primary"/>
                <ukm:DocumentMainType Value="UnitedKingdomPublicGeneralAct"/>
                <ukm:DocumentStatus Value="revised"/>
            </ukm:DocumentClassification>
            <ukm:Year Value="2020"/>
            <ukm:Number Value="2"/>
            <ukm:EnactmentDate Date="2020-01-30"/>
            <ukm:ISBN Value="9780105700746"/>
        </ukm:PrimaryMetadata>
    </ukm:Metadata>
</Legislation>
`;

test('MetadataParser parses primary legislation metadata', () => {
  const parser = new MetadataParser();
  const result = parser.parse(SAMPLE_METADATA_XML);

  assert.strictEqual(result.id, 'ukpga/2020/2', 'Should extract simplified id');
  assert.strictEqual(result.type, 'ukpga', 'Should extract type code');
  assert.strictEqual(result.year, 2020, 'Should extract year as number');
  assert.strictEqual(result.number, 2, 'Should extract number as number');
  assert.strictEqual(result.title, 'Direct Payments to Farmers (Legislative Continuity) Act 2020', 'Should extract title');
  assert.strictEqual(result.status, 'revised', 'Should extract document status');
  assert.deepStrictEqual(result.extent, ['E', 'W', 'S', 'NI'], 'Should normalize extent (N.I. → NI)');
  assert.strictEqual(result.enactmentDate, '2020-01-30', 'Should extract enactment date');
  assert.strictEqual(result.madeDate, undefined, 'Should not have madeDate for primary legislation');
  assert.strictEqual(result.startDate, '2024-01-01', 'Should extract start date from RestrictStartDate');
  assert.strictEqual(result.endDate, undefined, 'Should not have end date if not repealed');
});

test('MetadataParser handles extent normalization', () => {
  const parser = new MetadataParser();
  const xmlWithNI = SAMPLE_METADATA_XML.replace('RestrictExtent="E+W+S+N.I."', 'RestrictExtent="N.I."');

  const result = parser.parse(xmlWithNI);
  assert.deepStrictEqual(result.extent, ['NI'], 'Should normalize N.I. to NI');
});

test('MetadataParser handles missing extent', () => {
  const parser = new MetadataParser();
  const xmlWithoutExtent = SAMPLE_METADATA_XML.replace('RestrictExtent="E+W+S+N.I."', '');

  const result = parser.parse(xmlWithoutExtent);
  assert.strictEqual(result.extent, undefined, 'Should handle missing extent');
});

test('MetadataParser strips id prefix correctly', () => {
  const parser = new MetadataParser();

  // Test with http:// prefix
  let result = parser.parse(SAMPLE_METADATA_XML);
  assert.strictEqual(result.id, 'ukpga/2020/2', 'Should strip http://www.legislation.gov.uk/ prefix');

  // Test with https:// prefix (also valid)
  const httpsXml = SAMPLE_METADATA_XML.replace('http://www.legislation.gov.uk/', 'https://www.legislation.gov.uk/');
  result = parser.parse(httpsXml);
  assert.strictEqual(result.id, 'ukpga/2020/2', 'Should strip https://www.legislation.gov.uk/ prefix');

  // Test with id/ in the path
  const idXml = SAMPLE_METADATA_XML.replace(
    'DocumentURI="http://www.legislation.gov.uk/ukpga/2020/2"',
    'DocumentURI="http://www.legislation.gov.uk/id/ukpga/2020/2"'
  );
  result = parser.parse(idXml);
  assert.strictEqual(result.id, 'ukpga/2020/2', 'Should strip http://www.legislation.gov.uk/id/ prefix');
});
