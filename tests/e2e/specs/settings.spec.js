/// <reference types="cypress" />

describe('Settings Page', () => {
    beforeEach(() => {
        cy.visit('/settings');
    });

    it('should display the settings page title', () => {
        cy.get('ion-title').should('contain', 'Settings');
    });

    it('should show the settings toolbar', () => {
        cy.get('ion-toolbar').should('exist');
    });

    it('should have a menu button in the header', () => {
        cy.get('ion-menu-button').should('exist');
    });

    it('should display info card about why UUIDs are needed', () => {
        cy.contains('Why do we need UUIDs?').should('exist');
        cy.contains('We need UUIDs on iOS').should('exist');
    });

    it('should have a FAB button for adding UUIDs', () => {
        cy.get('ion-fab').should('exist');
        cy.get('ion-fab-button').should('exist');
    });

    it('should render the settings content area', () => {
        cy.get('ion-content').should('exist');
    });

    it('should have an ion-list for UUID entries', () => {
        cy.get('ion-list').should('exist');
    });
});
