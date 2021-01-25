import ScoringSet from 'core/js/ScoringSet';
import {
  getSubsetsByType
} from 'core/js/scoring';

export default class AssessmentsSet extends ScoringSet {

  initialize(options = {}, subsetParent = null) {
    super.initialize({
      ...options,
      id: 'assessments',
      type: 'assessments'
    }, subsetParent);
  }

  /**
   * Returns all unique assessment models for all or a subset of intersecting assessments
   * @returns {[Backbone.Model]}
   */
  get models() {
    return this.filterModels(getSubsetsByType('assessment').reduce((models, set) => {
      const items = set.models;
      if (!items) return models;
      return models.concat(items);
    }, []));
  }

  /**
   * Returns all assessment subsets
   * @returns {[AssessmentSet]}
   */
  get subsets() {
    return getSubsetsByType('assessment');
  }

  get minScore() {
    // TODO: finish
  }

  get maxScore() {
    // TODO: finish
  }

  get score() {
    // TODO: finish
  }

  get isComplete() {
    // TODO: finish
  }

  get isPassed() {
    // TODO: finish
  }

}
