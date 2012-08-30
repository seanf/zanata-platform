/*
 * Copyright 2011, Red Hat, Inc. and individual contributors
 * as indicated by the @author tags. See the copyright.txt file in the
 * distribution for a full listing of individual contributors.
 *
 * This is free software; you can redistribute it and/or modify it
 * under the terms of the GNU Lesser General Public License as
 * published by the Free Software Foundation; either version 2.1 of
 * the License, or (at your option) any later version.
 *
 * This software is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this software; if not, write to the Free
 * Software Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA
 * 02110-1301 USA, or see the FSF site: http://www.fsf.org.
 */
package org.zanata.webtrans.client.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import net.customware.gwt.presenter.client.EventBus;

import org.zanata.webtrans.client.events.DocumentSelectionEvent;
import org.zanata.webtrans.client.events.DocumentSelectionHandler;
import org.zanata.webtrans.client.events.NotificationEvent;
import org.zanata.webtrans.client.events.NotificationEvent.Severity;
import org.zanata.webtrans.client.events.RequestValidationEvent;
import org.zanata.webtrans.client.events.RunValidationEvent;
import org.zanata.webtrans.client.events.RunValidationEventHandler;
import org.zanata.webtrans.client.events.TransUnitSelectionEvent;
import org.zanata.webtrans.client.events.TransUnitSelectionHandler;
import org.zanata.webtrans.client.resources.TableEditorMessages;
import org.zanata.webtrans.client.resources.ValidationMessages;
import org.zanata.webtrans.client.ui.HasUpdateValidationWarning;
import org.zanata.webtrans.shared.validation.ValidationObject;
import org.zanata.webtrans.shared.validation.action.HtmlXmlTagValidation;
import org.zanata.webtrans.shared.validation.action.JavaVariablesValidation;
import org.zanata.webtrans.shared.validation.action.NewlineLeadTrailValidation;
import org.zanata.webtrans.shared.validation.action.PrintfVariablesValidation;
import org.zanata.webtrans.shared.validation.action.PrintfXSIExtensionValidation;
import org.zanata.webtrans.shared.validation.action.XmlEntityValidation;

import com.allen_sauer.gwt.log.client.Log;
import com.google.inject.Inject;

/**
 * 
 * @author Alex Eng <a href="mailto:aeng@redhat.com">aeng@redhat.com</a>
 * 
 **/

public class ValidationService
{
   private final Map<String, ValidationObject> validationMap = new HashMap<String, ValidationObject>();
   private final EventBus eventBus;
   private final TableEditorMessages messages;

   @Inject
   public ValidationService(final EventBus eventBus, final TableEditorMessages messages, final ValidationMessages valMessages)
   {
      this.eventBus = eventBus;
      this.messages = messages;

      HtmlXmlTagValidation htmlxmlValidation = new HtmlXmlTagValidation(valMessages);
      NewlineLeadTrailValidation newlineLeadTrailValidation = new NewlineLeadTrailValidation(valMessages);
      JavaVariablesValidation javaVariablesValidation = new JavaVariablesValidation(valMessages);
      XmlEntityValidation xmlEntityValidation = new XmlEntityValidation(valMessages);
      PrintfVariablesValidation printfVariablesValidation = new PrintfVariablesValidation(valMessages);
      PrintfXSIExtensionValidation positionalPrintfValidation = new PrintfXSIExtensionValidation(valMessages);
      printfVariablesValidation.mutuallyExclusive(positionalPrintfValidation);
      positionalPrintfValidation.mutuallyExclusive(printfVariablesValidation);

      validationMap.put(htmlxmlValidation.getId(), htmlxmlValidation);
      validationMap.put(newlineLeadTrailValidation.getId(), newlineLeadTrailValidation);
      validationMap.put(printfVariablesValidation.getId(), printfVariablesValidation);
      validationMap.put(positionalPrintfValidation.getId(), positionalPrintfValidation);
      validationMap.put(javaVariablesValidation.getId(), javaVariablesValidation);
      validationMap.put(xmlEntityValidation.getId(), xmlEntityValidation);

      eventBus.addHandler(RunValidationEvent.getType(), new RunValidationEventHandler()
      {
         @Override
         public void onValidate(RunValidationEvent event)
         {
            execute(event.getSourceContent(), event.getTarget(), event.isFireNotification(), event.getWidgetList());
         }
      });

      eventBus.addHandler(TransUnitSelectionEvent.getType(), new TransUnitSelectionHandler()
      {
         @Override
         public void onTransUnitSelected(TransUnitSelectionEvent event)
         {
            clearAllMessage();
         }
      });

      eventBus.addHandler(DocumentSelectionEvent.getType(), new DocumentSelectionHandler()
      {
         @Override
         public void onDocumentSelected(DocumentSelectionEvent event)
         {
            clearAllMessage();
         }
      });

   }

   /**
    * Run all enabled validators against the given strings. Generates a
    * {@link HasUpdateValidationWarning}, which will be empty if no warnings
    * were generated by the enabled validators.
    */
   public void execute(String source, String target, boolean fireNotification, ArrayList<HasUpdateValidationWarning> widgetList)
   {
      List<String> errors = new ArrayList<String>();

      for (String key : validationMap.keySet())
      {
         ValidationObject action = validationMap.get(key);

         if (action != null && action.isEnabled())
         {
            action.clearErrorMessage();
            action.validate(source, target);
            errors.addAll(action.getError());
         }
      }
      fireValidationWarningsEvent(errors, fireNotification, widgetList);
   }

   /**
    * Enable/disable validation action. Causes a {@link RequestValidationEvent}
    * to be fired.
    * 
    * @param key
    * @param isEnabled
    */
   public void updateStatus(String key, boolean isEnabled)
   {
      ValidationObject action = validationMap.get(key);
      action.setEnabled(isEnabled);

      // request re-run validation with new options
      eventBus.fireEvent(new RequestValidationEvent());
   }

   public List<ValidationObject> getValidationList()
   {
      return new ArrayList<ValidationObject>(validationMap.values());
   }

   /**
    * Clear all validation plugin's error messages
    */
   public void clearAllMessage()
   {
      for (String key : validationMap.keySet())
      {
         ValidationObject action = validationMap.get(key);

         if (action != null)
         {
            action.clearErrorMessage();
         }
      }
   }

   public void fireValidationWarningsEvent(List<String> errors, boolean fireNotification, ArrayList<HasUpdateValidationWarning> widgetList)
   {
      if (!errors.isEmpty() && fireNotification)
      {
         eventBus.fireEvent(new NotificationEvent(Severity.Info, messages.notifyValidationError()));
      }

      if (widgetList != null)
      {
         for (HasUpdateValidationWarning widget : widgetList)
         {
            widget.updateValidationWarning(errors);
         }
      }
   }
}
