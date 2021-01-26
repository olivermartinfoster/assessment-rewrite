import ScoringSet from 'core/js/ScoringSet';
import data from 'core/js/data';
import Adapt from 'core/js/adapt';

export default class BucketSet extends ScoringSet {

  initialize(options = {}, subsetParent = null) {
    super.initialize({
      ...options,
      id: options._id || '',
      type: 'bucket'
    }, subsetParent);
  }

  get models() {
    const models = data.toArray().filter(model => {
      const config = model.get('_buckets');
      return (config instanceof Array && config.includes(this.id));
    });
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
    Adapt.trigger('bucket:complete', this);
  }

  get isPassed() {
    // TODO: finish
  }

}
