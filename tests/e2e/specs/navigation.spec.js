/// <reference types="cypress" />

describe('Application Navigation', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should redirect to beacon scanner from root', () => {
        cy.url().should('include', '/beacon/scanner');
    });

    it('should navigate to beacon scanner page', () => {
        cy.goToScanner();
        cy.get('ion-title').should('contain', 'Beacon');
    });

    it('should navigate to beacon simulator page', () => {
        cy.goToSimulator();
        cy.get('ion-title').should('contain', 'Beacon');
    });

    it('should navigate to map page', () => {
        cy.goToMap();
        cy.get('ion-title').should('contain', 'Beacon Map');
    });

    it('should navigate to settings page', () => {
        cy.goToSettings();
        cy.get('ion-title').should('contain', 'Settings');
    });

    it('should navigate to login page', () => {
        cy.goToLogin();
        cy.get('ion-title').should('contain', 'Sign in');
    });

    it('should have a sidebar menu with navigation items', () => {
        cy.visit('/beacon/scanner');
        // The app has an ion-menu with navigation items
        cy.get('ion-menu').should('exist');
    });
});
