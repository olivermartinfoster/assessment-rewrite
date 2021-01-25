import scoring, {
  getScaledScoreFromMinMax,
  getSubsets,
  getSubsetsByType,
  getSubsetsByModelId,
  getSubsetById,
  getSubSetByPath,
  filterModels
} from 'core/js/scoring';

/**
 * The class provides an abstract that describes a set of models which can be extended with custom
 * scoring and completion behaviour.
 * Derivative class instances should act as both a root set of models (assessment-blocks) and an
 * intersected set of models (retention-question-components vs assessment-blocks).
 * Set intersections are performed by comparing overlapping hierachies, such that a model will be
 * considered in both sets when it is equal to, a descendant of or an ancestor of a model in the intersecting
 * set. An assessment-block may contain a retention-question-component, a retention-question-component
 * may be contained in an assessment-block and an assessment-block may be equal to an assessment-block.
 * The last intersected set will always provide the returned set Class pertaining to its abstraction,
 * such that retention-question-components vs assessment-blocks would always give a subset of
 * assessment-blocks whereas assessment-blocks vs retention-question-components will always
 * give a subset of retention-requestion-components.
 * Intersected sets will always only include models from their prospective set.
 */
export default class ScoringSet extends Backbone.Controller {

  initialize({
    id = null,
    type = null,
    title = '',
    isScoreIncluded = false,
    isCompletionRequired = false
  } = {}, subsetParent = null) {
    this._subsetParent = subsetParent;
    this._id = id;
    this._type = type;
    this._title = title;
    this._isScoreIncluded = isScoreIncluded;
    this._isCompletionRequired = isCompletionRequired;
    if (!this._subsetParent) {
      // Register root sets only here as subsets are dynamically created when required
      this.register();
    }
    this._wasComplete = this.isComplete;
    this._wasPassed = this.isPassed;
  }

  register() {
    scoring.register(this);
  }

  get subsetParent() {
    return this._subsetParent;
  }

  get id() {
    return this._id;
  }

  get type() {
    return this._type;
  }

  get title() {
    return this._title;
  }

  get isScoreIncluded() {
    return this._isScoreIncluded;
  }

  get isCompletionRequired() {
    return this._isCompletionRequired;
  }

  /**
   * Override this property to return a set specific minimum score
   * @returns {number}
   */
  get minScore() {}

  /**
   * Override this property to return a set specific maxiumum score
   * @returns {number}
   */
  get maxScore() {}

  /**
   * Override this property to return a set specific score score
   * @returns {number}
   */
  get score() {}

  /**
   * Returns a percentage score relative to the minimum and maximum values
   * @returns {number}
   */
  get scaledScore() {
    return getScaledScoreFromMinMax(this.score, this.minScore, this.maxScore);
  }

  /**
   * Override this property to return a set specific completion
   * @returns {boolean}
   */
  get isComplete() {}

  /**
   * Override this function to perform set specific completion tasks
   */
  onCompleted() {}

  /**
   * Override this property to return a set specific passing criteria
   * @returns {boolean}
   */
  get isPassed() {}

  /**
   * Override this function to perform specific passing tasks
   */
  onPassed() {}

  /**
   * Executed when _isInteractionComplete changes
   */
  update() {
    const isComplete = this.isComplete;
    const hasCompletionChanged = (this._wasComplete !== isComplete);
    if (isComplete && hasCompletionChanged) {
      this.onCompleted();
    }
    const isPassed = this.isPassed;
    const hasPassStateChanged = (this._wasPassed !== isPassed);
    if (isPassed && hasPassStateChanged) {
      this.onPassed();
    }
  }

  /**
   * Returns a unique array of models, filtered for _isAvailable and intersecting subsets hierarchies
   * Always finish by calling `this.filterModels(models)`
   * @returns {[Backbone.Model]}
   */
  get models() {}

  filterModels(models) {
    return filterModels(this, models);
  }

  /**
   * Returns all prospective subsets
   * @returns {[ScoringSet]}
   */
  get subsets() {
    return getSubsets(this);
  }

  /**
   * @param {string} setId
   * @returns {[ScoringSet]}
   */
  getSubsetById(setId) {
    return getSubsetById(setId, this);
  }

  /**
   * @param {string} setType
   * @returns {[ScoringSet]}
   */
  getSubsetsByType(setType) {
    return getSubsetsByType(setType, this);
  }

  /**
   * @param {string} modelId
   * @returns {[ScoringSet]}
   */
  getSubsetsByModelId(modelId) {
    return getSubsetsByModelId(modelId, this);
  }

  /**
   * @param {string|[string]} path
   * @returns {[ScoringSet]}
   */
  getSubsetByPath(path) {
    return getSubSetByPath(path, this);
  }

}
