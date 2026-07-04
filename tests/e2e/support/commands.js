// ***********************************************
// Custom Cypress commands for SemBeacon app testing
// ***********************************************

/**
 * Navigate to the beacon scanner page
 */
Cypress.Commands.add('goToScanner', () => {
    cy.visit('/beacon/scanner');
    cy.get('ion-title').should('contain', 'Beacon');
});

/**
 * Navigate to the beacon simulator page
 */
Cypress.Commands.add('goToSimulator', () => {
    cy.visit('/beacon/simulator');
    cy.get('ion-title').should('contain', 'Beacon');
});

/**
 * Navigate to the map page
 */
Cypress.Commands.add('goToMap', () => {
    cy.visit('/map');
    cy.get('ion-title').should('contain', 'Beacon Map');
});

/**
 * Navigate to the settings page
 */
Cypress.Commands.add('goToSettings', () => {
    cy.visit('/settings');
    cy.get('ion-title').should('contain', 'Settings');
});

/**
 * Navigate to the login page
 */
Cypress.Commands.add('goToLogin', () => {
    cy.visit('/login');
    cy.get('ion-title').should('contain', 'Sign in');
});
