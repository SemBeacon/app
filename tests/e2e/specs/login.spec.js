/// <reference types="cypress" />

describe('Login Page', () => {
    beforeEach(() => {
        cy.visit('/login');
    });

    it('should display the login page title', () => {
        cy.get('ion-title').should('contain', 'Sign in to your Solid Pod');
    });

    it('should show a back button', () => {
        cy.get('ion-back-button').should('exist');
    });

    it('should display the Solid logo', () => {
        cy.get('img.logo').should('exist');
    });

    it('should have an issuer input field', () => {
        cy.get('ion-input').should('exist');
    });

    it('should display known issuers in datalist', () => {
        cy.get('datalist#issuers').should('exist');
        cy.get('datalist#issuers option').should('have.length.at.least', 1);
    });

    it('should have a Sign in button', () => {
        cy.contains('ion-button', 'Sign in').should('exist');
    });

    it('should have a Sign up button linking to solidweb.org', () => {
        cy.contains('ion-button', 'Sign up').should('exist');
    });

    it('should display info card about data privacy', () => {
        cy.get('.info-card').should('exist');
    });

    it('should have a link to learn more about Solid', () => {
        cy.contains('Click here for').should('exist');
    });

    it('should show the login toolbar with transparent background', () => {
        cy.get('#login-toolbar').should('exist');
    });

    it('should have content container with padding', () => {
        cy.get('#container').should('exist');
    });
});
