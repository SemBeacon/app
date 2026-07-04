/// <reference types="cypress" />

describe('Beacon Scanner Page', () => {
    beforeEach(() => {
        cy.visit('/beacon/scanner');
    });

    it('should display the beacon scanner page title', () => {
        cy.get('ion-title').should('contain', 'Beacon');
    });

    it('should show the scanner toolbar', () => {
        cy.get('ion-toolbar').should('exist');
    });

    it('should have a menu button in the header', () => {
        cy.get('ion-menu-button').should('exist');
    });

    it('should render the BLEScannerComponent content area', () => {
        cy.get('ion-content').should('exist');
    });

    it('should have a FAB button for scanning', () => {
        cy.get('ion-fab').should('exist');
        cy.get('ion-fab-button').should('exist');
    });

    it('should show help text when no beacons are found and not scanning', () => {
        // When beaconStore.state is READY but no beacons and not scanning,
        // the help text should appear
        cy.get('.help-text').should('exist');
    });

    it('should have segment buttons for scanner/simulator tabs (non-iOS)', () => {
        cy.get('ion-segment').should('exist');
        cy.get('ion-segment-button').contains('Scanner').should('exist');
        cy.get('ion-segment-button').contains('Simulator').should('exist');
    });

    it('should navigate to simulator when clicking Simulator tab', () => {
        cy.get('ion-segment-button').contains('Simulator').click({ force: true });
        cy.url().should('include', '/beacon/simulator');
    });

    it('should navigate back to scanner when clicking Scanner tab', () => {
        cy.visit('/beacon/simulator');
        cy.get('ion-segment-button').contains('Scanner').click({ force: true });
        cy.url().should('include', '/beacon/scanner');
    });
});
