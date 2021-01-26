import ScoringSet from 'core/js/ScoringSet';
import {
  getSubsetsByType
} from 'core/js/scoring';

export default class BucketsSet extends ScoringSet {

  initialize(options = {}, subsetParent = null) {
    super.initialize({
      ...options,
      id: 'buckets',
      type: 'buckets'
    }, subsetParent);
  }

  /**
   * Returns all unique bucket models for all buckets or a subset of intersecting buckets
   * @returns {[Backbone.Model]}
   */
  get models() {
    const models = getSubsetsByType('bucket').reduce((models, set) => {
      const items = set.models;
      if (!items) return models;
      return models.concat(items);
    }, []);
    return this.filterModels(models);
  }

  /**
   * Returns all bucket subsets
   * @returns {[BucketSet]}
   */
  get subsets() {
    return getSubsetsByType('bucket');
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
