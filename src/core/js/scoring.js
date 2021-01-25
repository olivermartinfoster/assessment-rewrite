import Adapt from './adapt';
import data from './data';

/** @typedef {import("./ScoringSet").default} ScoringSet */

/**
 * Returns the percentage position of score between minScore and maxScore
 * @param {number} score
 * @param {number} minScore
 * @param {number} maxScore
 * @returns {number}
 */
export function getScaledScoreFromMinMax(score, minScore, maxScore) {
  const distance = maxScore - minScore;
  const relativeScore = score - minScore;
  return 100 / distance * relativeScore;
}

/**
 * Return models from listA which are present in listB, are descendents of listB
 * or have listB models as descendents
 * @param {[Backbone.Model]} listA
 * @param {[Backbone.Model]} listB
 * @returns {[Backbone.Model]}
 */
export function filterIntersectingHierarchy(listA, listB) {
  const listBModels = listB.reduce((allDescendents, model) => allDescendents.concat([model], model.getAllDescendantModels()), []);
  const listBModelsIndex = _.indexBy(listBModels, model => model.get('_id'));
  return listA.filter(model => {
    const isADescendentOfB = listBModelsIndex[model.get('_id')];
    if (isADescendentOfB) return true;
    const listAModels = [model].concat(model.getAllDescendantModels());
    const listAModelsIndex = _.indexBy(listAModels, model => model.get('_id'));
    const isBDescendentOfA = Boolean(Object.keys(listAModelsIndex).find(key => listBModelsIndex[key]));
    if (isBDescendentOfA) return true;
  });
}

/**
 * Return a boolean to indicate if any model from listA is present in listB, is a descendents of listB
 * or has listB models as descendents
 * @param {[Backbone.Model]} listA
 * @param {[Backbone.Model]} listB
 * @returns {boolean}
 */
export function hasIntersectingHierarchy(listA, listB) {
  const listBModels = listB.reduce((allDescendents, model) => allDescendents.concat([model], model.getAllDescendantModels()), []);
  const listBModelsIndex = _.indexBy(listBModels, model => model.get('_id'));
  return Boolean(listA.find(model => {
    const isADescendentOfB = listBModelsIndex[model.get('_id')];
    if (isADescendentOfB) return true;
    const listAModels = [model].concat(model.getAllDescendantModels());
    const listAModelsIndex = _.indexBy(listAModels, model => model.get('_id'));
    const isBDescendentOfA = Boolean(Object.keys(listAModelsIndex).find(key => listBModelsIndex[key]));
    if (isBDescendentOfA) return true;
  }));
}

/**
 * Return a subset from the given sets, reduces from left to right, returning
 * the class of the furthest right most set
 * This effectively makes a pipe of parent-child related sets which use each parent
 * in turn to reduce the models in the next subset
 * @param {[ScoringSet]} sets
 * @returns {ScoringSet}
 */
export function createIntersectionSubset(sets) {
  const subsetParent = sets[0];
  return sets.slice(1).reduce((subsetParent, set) => {
    if (!set) return subsetParent;
    const Class = Object.getPrototypeOf(set).constructor;
    return new Class(set, subsetParent);
  }, subsetParent);
}

/**
 * Returns all sets or all sets without the specified excludeParent
 * @param {ScoringSet} [excludeParent]
 */
export function getRawSets(excludeParent = null) {
  return excludeParent ?
    Adapt.scoring.subsets.filter(set => !(set.id === excludeParent.id && set.type === excludeParent.type)) :
    Adapt.scoring.subsets;
}

/**
 * Returns all root set or the intersection sets from subsetParent
 * @param {ScoringSet} subsetParent
 * @returns {[ScoringSet]}
 */
export function getSubsets(subsetParent = undefined) {
  let sets = getRawSets(subsetParent);
  if (subsetParent) {
    // Create intersection sets between the found sets and the subsetParent
    sets = sets.map(set => createIntersectionSubset([subsetParent, set]));
  }
  return sets;
}

/**
 * Returns all root set of type or the intersection sets from subsetParent of type
 * @param {string} setType
 * @param {ScoringSet} [subsetParent]
 * @returns {[ScoringSet]}
 */
export function getSubsetsByType(setType, subsetParent = undefined) {
  let sets = getRawSets(subsetParent).filter(set => setType === set.type);
  if (subsetParent) {
    // Create intersection sets between the found sets and the subsetParent
    sets = sets.map(set => createIntersectionSubset([subsetParent, set]));
  }
  return sets;
}

/**
 * Returns all root sets or the intersection sets from subsetParent which also
 * intersect the given model
 * @param {string} modelId
 * @param {ScoringSet} [subsetParent]
 * @returns {[ScoringSet]}
 */
export function getSubsetsByModelId(modelId, subsetParent = undefined) {
  const models = [Adapt.findById(modelId)];
  let sets = getRawSets(subsetParent).filter(set => hasIntersectingHierarchy(set.models, models));
  if (subsetParent) {
    // Create intersection sets between the found sets and the subsetParent
    sets = sets.map(set => createIntersectionSubset([subsetParent, set]));
  }
  return sets;
}

/**
 * Returns the root set by id or the intersection from the subsetParent by id
 * @param {string} setId
 * @param {ScoringSet} [subsetParent]
 * @returns {ScoringSet}
 */
export function getSubsetById(setId, subsetParent = undefined) {
  const sets = getRawSets(subsetParent);
  let set = sets.find(set => setId === set.id);
  if (subsetParent) {
    // Create an intersection set between the found set and the subsetParent
    set = createIntersectionSubset([subsetParent, set]);
  }
  return set;
}

/**
 * Create intersection subset from an id path
 * @param {[string]|string} path
 * @param {ScoringSet} [subsetParent]
 * @returns {ScoringSet}
 */
export function getSubSetByPath(path, subsetParent = undefined) {
  if (typeof path === 'string') {
    // Allow 'id.id.id' style lookup
    path = path.split('.');
  }
  // Fetch all of the sets named in the path in order
  const sets = path.map(id => getSubsetById(id));
  if (subsetParent) {
    // Add subsetParent as the starting set
    sets.unshift(subsetParent);
  }
  // Create an intersection set from all found sets in order
  return createIntersectionSubset(sets);
}

/**
 * Finish set model arrays by applying standard uniqueness, _isAvailable and subset
 * intersection filters
 * @param {ScoringSet} set
 * @param {[Backbone.Models]} models
 * @returns {[Backbone.Models]}
 */
export function filterModels(set, models) {
  if (!models) return null;
  models = _.uniq(models, model => model.get('_id'));
  if (set.subsetParent && set.subsetParent.models) {
    // Return only this set's items intersecting with or with intersecting descendants or
    // ancestors from the parent list
    models = filterIntersectingHierarchy(models, set.subsetParent.models);
  }
  return models.filter(model => model.get('_isAvailable'));
}

/**
 * API for creating completion and scoring model sets
 */
class Scoring extends Backbone.Controller {

  initialize() {
    /**
     * All registered sets
     * @type {ScoringSet}
     */
    this._rawSets = [];
    this.setUpEventListeners();
  }

  setUpEventListeners() {
    this.listenTo(data, 'change:_isInteractionComplete', this.update);
  }

  /**
   * Force all registered sets to recalculate their states
   */
  update() {
    this.subsets.forEach(set => set.update());
  }

  /**
   * Register a configured root scoring set
   * This is usual performed automatically upon ScoringSet instantiation
   * @param {ScoringSet} newSet
   */
  register(newSet) {
    const hasDuplicatedId = Boolean(this._rawSets.find(set => set.id === newSet.id));
    if (hasDuplicatedId) {
      throw new Error(`Cannot register two sets with the same id: ${newSet.id}`);
    }
    this._rawSets.push(newSet);
  }

  /**
   * Return all root sets marked with isCompletionRequired
   * @returns {[ScoringSet]}
   */
  get completionSets() {
    return this._rawSets.filter(({ isCompletionRequired }) => isCompletionRequired);
  }

  /**
   * Returns a boolean indication if all root sets marked with isCompletionRequired
   * as isComplete = true
   * @returns {boolean}
   */
  get isComplete() {
    return !this.completionSets.find(set => !set.isComplete);
  }

  /**
   * Return all root sets marked with isScoreIncluded
   * @returns {[ScoringSet]}
   */
  get scoringSets() {
    return this._rawSets.filter(({ isScoreIncluded }) => isScoreIncluded);
  }

  /**
   * Returns a number representing the sum of all isScoreIncluded root models minScore values
   * @returns {number}
   */
  get minScore() {
    // TODO: finish
    return this.scoringSets.reduce((minScore, set) => minScore + set.minScore, 0);
  }

  /**
   * Returns a number representing the sum of all isScoreIncluded root models maxScore values
   * @returns {number}
   */
  get maxScore() {
    // TODO: finish
    return this.scoringSets.reduce((maxScore, set) => maxScore + set.maxScore, 0);
  }

  /**
   * Returns a number representing the sum of all isScoreIncluded root models score values
   * @returns {number}
   */
  get score() {
    // TODO: finish
    return this.scoringSets.reduce((score, set) => score + set.score, 0);
  }

  /**
   * Returns a number representing the percentage position of score between minScore and maxScore
   * @returns {number}
   */
  get scaledScore() {
    return getScaledScoreFromMinMax(this.score, this.minScore, this.maxScore);
  }

  /**
   * Returns all unique subset models
   * @returns {[Backbone.Model]}
   */
  get models() {
    const models = this.subsets.reduce((models, set) => models.concat(set.models), []);
    return _.uniq(models, model => model.get('_id'));
  }

  /**
   * Returns all registered root sets
   * @returns {[ScoringSet]}
   */
  get subsets() {
    return this._rawSets;
  }

  /**
   * Returns all registered root sets of type
   * @param {string} setType
   * @returns {[ScoringSet]}
   */
  getSubsetsByType(setType) {
    return getSubsetsByType(setType);
  }

  /**
   * Returns all registered root sets intersecting the given model id
   * @param {string} modelId
   * @returns {[ScoringSet]}
   */
  getSubsetsByModelId(modelId) {
    return getSubsetsByModelId(modelId);
  }

  /**
   * Returns a registered root sets by id
   * @param {string} setId
   * @returns {ScoringSet}
   */
  getSubsetById(setId) {
    return getSubsetById(setId);
  }

  /**
   * Returns a root set or intersection set by path
   * @param {string|[string]} path
   * @returns {ScoringSet}
   */
  getSubsetByPath(path) {
    return getSubSetByPath(path);
  }

}

export default (Adapt.scoring = new Scoring());
