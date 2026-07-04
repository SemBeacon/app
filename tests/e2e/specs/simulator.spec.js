/// <reference types="cypress" />

describe('Beacon Simulator Page', () => {
    beforeEach(() => {
        cy.visit('/beacon/simulator');
    });

    it('should display the beacon simulator page title', () => {
        cy.get('ion-title').should('contain', 'Beacon');
    });

    it('should show the simulator toolbar', () => {
        cy.get('ion-toolbar').should('exist');
    });

    it('should have a menu button in the header', () => {
        cy.get('ion-menu-button').should('exist');
    });

    it('should render the BLESimulatorComponent content area', () => {
        cy.get('ion-content').should('exist');
    });

    it('should have a FAB button for adding beacons', () => {
        cy.get('ion-fab').should('exist');
        cy.get('ion-fab-button').should('exist');
    });

    it('should show Solid sign-in card when no beacons exist', () => {
        // When there are no simulated beacons, info cards should appear
        cy.get('ion-card').should('exist');
    });

    it('should have segment buttons for scanner/simulator tabs', () => {
        cy.get('ion-segment').should('exist');
        cy.get('ion-segment-button').contains('Scanner').should('exist');
        cy.get('ion-segment-button').contains('Simulator').should('exist');
    });

    it('should navigate to scanner when clicking Scanner tab', () => {
        cy.get('ion-segment-button').contains('Scanner').click({ force: true });
        cy.url().should('include', '/beacon/scanner');
    });
});
