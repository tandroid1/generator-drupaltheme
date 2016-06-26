'use strict';
var generators = require('yeoman-generator');
var yosay = require('yosay');
var _s = require('underscore.string');
var mkdirp = require('mkdirp');

module.exports = generators.Base.extend({
  constructor: function () {
    generators.Base.apply(this, arguments);

    this.capitalizeFirst = function(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }
  },

  prompting: function () {
    // var done = this.async();
    // var gen = this;

    this.log(yosay('Hi! I\'m here to help you set up your Drupal theme!'));

    var prompts = [{
      type: 'input',
      name: 'themeDesc',
      message: 'A short description of your theme.',
    }, {
      type: 'checkbox',
      name: 'features',
      message: 'What more would you like?',
      choices: [{
        name: 'Foundation',
        value: 'includeFoundation',
        checked: true
      }, {
        name: 'Babel',
        value: 'includeBabel',
        checked: true
      }, {
        name: 'Modernizr',
        value: 'includeModernizr',
        checked: true
      }]
    }, {
      type: 'confirm',
      name: 'includeRollup',
      message: 'Would you like to use rollup.js to enable ES2015 modules?',
      default: true,
      when: function (answers) {
        return answers.features.indexOf('includeBabel') > 0;
      }
    }];

    return this.prompt(prompts).then(function (answers) {
      var features = answers.features;

      function hasFeature(feat) {
        return features && features.indexOf(feat) !== -1;
      };


      // manually deal with the response, get back and store the results.
      // we change a bit this way of doing to automatically do this in the self.prompt() method.
      this.includeSass = hasFeature('includeFoundation');
      this.includeBabel = hasFeature('includeBabel');
      this.includeModernizr = hasFeature('includeModernizr');
      this.includeRollup = answers.includeRollup;
      this.themeDesc = answers.themeDesc;

    }.bind(this));
  },

  writing: {
    gulpfile: function () {
      this.log(`Has Rollup: ${this.includeRollup}`);
      this.fs.copyTpl(
        this.templatePath('gulpfile.js'),
        this.destinationPath('gulpfile.js'),
        {
          date: (new Date).toISOString().split('T')[0],
          name: this.name,
          includeSass: this.includeFoundation,
          includeBabel: this.includeBabel,
          includeRollup: this.includeRollup
        }
      );
    },

    packageJSON: function () {
      this.fs.copyTpl(
        this.templatePath('_package.json'),
        this.destinationPath('package.json'),
        {
          name: this.appname,
          description: this.themeDesc,
          includeSass: this.includeFoundation,
          includeBabel: this.includeBabel,
          includeRollup: this.includeRollup
        }
      );
    },

    git: function () {
      this.fs.copy(
        this.templatePath('gitignore'),
        this.destinationPath('.gitignore'));

      this.fs.copy(
        this.templatePath('gitattributes'),
        this.destinationPath('.gitattributes'));
    },

    bower: function () {
      var bowerJson = {
        name: _s.slugify(this.appname),
        private: true,
        dependencies: {}
      };

      if (this.includeModernizr) {
        bowerJson.dependencies['modernizr'] = '~2.8.1';
      }

      this.fs.writeJSON('bower.json', bowerJson);
      this.fs.copy(
        this.templatePath('bowerrc'),
        this.destinationPath('.bowerrc')
      );
    },

    nvm: function() {
      this.fs.copyTpl(
        this.templatePath('nvmrc'),
        this.destinationPath('.nvmrc')
      );
    },

    styles: function () {
      this.fs.copy(
        this.templatePath('css/**'),
        this.destinationPath('css/')
      );

      if (this.includeSass) {
        this.fs.copy(
          this.templatePath('css/**'),
          this.destinationPath('css/')
        );
      }
    },

    scripts: function() {
      if (this.includeRollup) {
        this.fs.copy(
          this.templatePath('js_es2015/**'),
          this.destinationPath('js/')
        );
      } else {
        this.fs.copy(
          this.templatePath('js/**'),
          this.destinationPath('js/')
        );
      }
    },

    drupalFiles: function() {
      // themename.info.yml
      this.fs.copyTpl(
        this.templatePath('themename.info.yml'),
        this.destinationPath(this.appname + '.info.yml'),
        {
          machineName: this.appname,
          humanName: this.capitalizeFirst(this.appname),
          description: this.themeDesc
        }
      );

      // themename.libraries.yml
      this.fs.copyTpl(
        this.templatePath('themename.libraries.yml'),
        this.destinationPath(this.appname + '.libraries.yml')
      );

      // themename.theme
      this.fs.copyTpl(
        this.templatePath('themename.theme'),
        this.destinationPath(this.appname + '.theme'),
        { name: this.appname }
      );

      this.fs.copy(
        this.templatePath('logo.svg'),
        this.destinationPath('logo.svg')
      );
    },

    drupalTemplates: function() {
      this.fs.copy(
        this.templatePath('drupal_templates/**'),
        this.destinationPath('templates/')
      );
    }
  },
  install: function () {
    this.installDependencies({bower: false});
  },
  end: function() {
    this.log('Congrats! You can now enable your theme within Drupal!');
  }
});
