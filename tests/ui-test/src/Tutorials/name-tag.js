import { DomObject } from '../lib/dom-object';
import assert from "assert";
let { tutorials } = require('../lib/css-value');

class NameTag extends DomObject {

    async nameTag() {

        await this.click(tutorials.nameTag, tutorials.closeButton,
            tutorials.nameTag, tutorials.startTutorialButton);

        let headerTitle = await this.getText(tutorials.headerTitle);
        assert.equal(headerTitle, 'Name Tag');
        console.debug(`The title of the current window is "${headerTitle}"`);

        await this.click(tutorials.okButton);

        for (let i = 1; i < 4; i++) {

            await this.click(tutorials.goNextButton);
            let cssValueOfSelectLabel = await this.getAttribute(tutorials.selectedLabel, 'class');
            assert.equal(cssValueOfSelectLabel, 'ui circular label blue selected ');

            let selectLabel = await this.getAttribute(tutorials.selectedLabel, 'aria-label');
            console.log(selectLabel);
        }

        await this.click(tutorials.okButton,tutorials.finishButton, tutorials.microbitLogo);
        await this.click(tutorials.prograss)

        let projectName = await this.getAttribute(tutorials.projectName, 'value');
        assert.equal(projectName, 'Name Tag');
        console.debug(`The current project name is "${projectName}"`);

        await this.click(tutorials.microbitLogo);

    }

    test() {
        it('Start learning the name tag', async () => {
            return await this.nameTag();
        });
    }

}
export let nameTag = new NameTag();