import Adapt from 'core/js/adapt';
import data from 'core/js/data';
import AssessmentsSet from './AssessmentsSet';
import AssessmentSet from './AssessmentSet';

class Assessment extends Backbone.Controller {

  initialize() {
    this.listenTo(Adapt, {
      'app:dataReady': this.onDataReady
    });
  }

  onDataReady() {
    new AssessmentsSet();
    const assessments = data.filter(model => {
      const config = model.get('_assessment');
      return (config && config._isEnabled);
    });
    assessments.forEach(model => new AssessmentSet({ model }));
  }

}

export default (Adapt.assessment = new Assessment());
