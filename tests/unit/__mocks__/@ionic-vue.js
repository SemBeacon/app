const Vue = require('vue');

// Create stub components for all Ionic components
const ionicComponents = [
    'IonApp', 'IonPage', 'IonHeader', 'IonFooter', 'IonContent', 'IonToolbar',
    'IonTitle', 'IonMenu', 'IonMenuButton', 'IonBackButton', 'IonButtons',
    'IonButton', 'IonIcon', 'IonItem', 'IonLabel', 'IonList', 'IonInput',
    'IonSelect', 'IonSelectOption', 'IonToggle', 'IonCard', 'IonCardHeader',
    'IonCardContent', 'IonCardTitle', 'IonCardSubtitle', 'IonAvatar',
    'IonThumbnail', 'IonRow', 'IonCol', 'IonGrid', 'IonFab', 'IonFabButton',
    'IonSpinner', 'IonProgressBar', 'IonSegment', 'IonSegmentButton',
    'IonListHeader', 'IonMenuToggle', 'IonSplitPane', 'IonRouterOutlet',
    'IonNote', 'IonItemSliding', 'IonItemOptions', 'IonItemOption',
    'IonCheckbox', 'IonSearchbar', 'IonActionSheet', 'IonTab', 'IonTabs',
    'IonTabBar', 'IonTabButton',
];

const mocks = {};
ionicComponents.forEach((name) => {
    mocks[name] = Vue.defineComponent({
        name: name,
        template: `<div class="${name.toLowerCase()}"><slot /></div>`,
    });
});

// Mock controllers
mocks.actionSheetController = {
    create: jest.fn().mockResolvedValue({ present: jest.fn() }),
};
mocks.alertController = {
    create: jest.fn().mockResolvedValue({ present: jest.fn() }),
};
mocks.toastController = {
    create: jest.fn().mockResolvedValue({ present: jest.fn() }),
};

module.exports = mocks;
