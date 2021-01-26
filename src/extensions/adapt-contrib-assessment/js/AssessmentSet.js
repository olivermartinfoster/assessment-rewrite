import ScoringSet from 'core/js/ScoringSet';
import Adapt from 'core/js/adapt';

export default class AssessmentSet extends ScoringSet {

  initialize(options = {}, subsetParent = null) {
    this._model = options.model;
    super.initialize({
      ...options,
      id: this._model.get('_id'),
      type: 'assessment'
    }, subsetParent);
  }

  get model() {
    return this._model;
  }

  get models() {
    const models = this.model.getChildren().toArray();
    return this.filterModels(models);
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
    return !(this.models.find(model => !model.get('_isComplete')));
  }

  onCompleted() {
    Adapt.trigger('assessments:complete', this);
  }

  get isPassed() {
    // TODO: finish
    // single score
    //  this.score
    // subset dependent scores
    //  { "engagement": 10 }
    //  [ { score: 10, setName: "engagement" } ]
    //  ""
  }

}
