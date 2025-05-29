import { getRebase } from '../../src/utils/rebase';
const baseContent = require('./base-content.json');
const bothChangedContent = require('./both-changed-content.json');
const masterContent = require('./master-content.json');
const revisionContent = require('./revision-content.json');

describe('Rebase', () => {

  it('master content have not changed, revision content have not changed', () => {
    const masterChangedContent = baseContent;
    const revisionChangedContent = revisionContent;
    const output = getRebase(masterChangedContent, baseContent, revisionChangedContent);
    const input = { canMerge: true, isNeedReplaceMaster: true, value: revisionChangedContent };
    expect(input).toEqual(output);
  });

  it('master content have not changed, revision content have changed', () => {
    const masterChangedContent = baseContent;
    const revisionChangedContent = baseContent;
    const output = getRebase(masterChangedContent, baseContent, revisionChangedContent);
    const input = { canMerge: true, isNeedReplaceMaster: true, value: revisionChangedContent };
    expect(input).toEqual(output);
  });

  it('revision content have not changed, master content have changed', () => {
    const masterChangedContent = masterContent;
    const revisionChangedContent = baseContent;
    const output = getRebase(masterChangedContent, baseContent, revisionChangedContent);
    const input = { canMerge: true, isNeedReplaceMaster: false, value: masterChangedContent };
    expect(input).toEqual(output);
  });

  it('revision content have changed, master content have changed', () => {
    const masterChangedContent = masterContent;
    const revisionChangedContent = revisionContent;
    const output = getRebase(masterChangedContent, baseContent, revisionChangedContent);
    const input = { canMerge: false, isNeedReplaceMaster: true, value: bothChangedContent };
    expect(input.canMerge).toEqual(output.canMerge);
    expect(input.isNeedReplaceMaster).toEqual(output.isNeedReplaceMaster);
  });

});

