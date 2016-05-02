if (Meteor.isClient) {

  var typingTimer; //timer identifier

  /***********************
  Rendering
  ***********************/

  Template.agreement.rendered = function () {
    var editor = new MediumEditor('#editor', {
      /* These are the default options for the editor,
          if nothing is passed this is what is used */
      activeButtonClass: 'medium-editor-button-active',
      toolbar: {
        buttons: ['bold', 'italic', 'anchor', 'h2', 'h3', 'unorderedlist', 'quote'],
        diffLeft: 25,
        diffTop: -10,
        allowMultiParagraphSelection: true
      },
      buttonLabels: false,
      contentWindow: window,
      delay: 0,
      disableReturn: false,
      disableDoubleReturn: false,
      disableExtraSpaces: false,
      disableEditing: false,
      autoLink: true,
      elementsContainer: false,
      extensions: {},
      ownerDocument: document,
      spellcheck: true,
      targetBlank: true,
      anchor: {
        placeholderText: TAPi18n.__('type-link'),
        linkValidation: true
      },
      paste: {
          forcePlainText: true,
          cleanPastedHTML: true,
          cleanAttrs: ['style', 'dir'],
          cleanTags: ['label', 'meta', 'div', 'span']
      },
      anchorPreview: {
          hideDelay: 0
      },
      placeholder: false
    });

    editor.subscribe('editableInput', function(event, editable) {
      Meteor.clearTimeout(typingTimer);
      typingTimer = Meteor.setTimeout(function () {
        if (Session.get('missingDescription') == false) {
          saveDescription(document.getElementById('editor').innerHTML);
        } else {
          saveDescription('');
        }
      }, SERVER_INTERVAL);
    });

    //to avoid duplicate fragments + caret displacement, it manually handles contenteditable update
    var t = this;
    this.contentAutorun = Deps.autorun(function () {
        var content = Contracts.findOne( { _id: Session.get('contractId') }, {reactive: false} );
        if (content) {
          if (content.description.length <= 1) {
            t.find(".cr-note").innerHTML = TAPi18n.__('placeholder-editor');
            Session.set('missingDescription', true);
          } else {
            t.find(".cr-note").innerHTML = content.description;
            Session.set('missingDescription', false);
          }
        }
    });

  };



  /***********************
  Helpers
  **********************/

  Template.agreement.helpers({
    sampleMode: function () {
      if (Session.get('missingDescription')) {
        return 'sample';
      } else {
        return '';
      }
    }
  });



  /***********************
  Event Handlers
  **********************/

  Template.agreement.events({
    "focus #editor": function (event) {
      if (Session.get('missingDescription')) {
        document.getElementById("editor").innerText = '';
        Session.set('missingDescription',false);
      }
    },
    "blur #editor": function (event) {
      var content = strip(document.getElementById("editor").innerHTML);
      if (content.length <= 1) {
        Session.set('missingDescription',true);
        document.getElementById("editor").innerText = TAPi18n.__('placeholder-editor');
      }
    }
  });

}