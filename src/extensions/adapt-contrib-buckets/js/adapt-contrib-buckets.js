import Adapt from 'core/js/adapt';
import data from 'core/js/data';
import BucketsSet from './BucketsSet';
import BucketSet from './BucketSet';

class Buckets extends Backbone.Controller {

  initialize() {
    this.listenTo(Adapt, {
      'app:dataReady': this.onDataReady
    });
  }

  onDataReady() {
    new BucketsSet();
    const courseModel = data.find(model => model.get('_type') === 'course');
    const config = courseModel.get('_buckets');
    if (!config || !config._isEnabled) return;
    config._items.forEach(bucketConfig => new BucketSet(bucketConfig));
  }

}

export default (Adapt.buckets = new Buckets());
